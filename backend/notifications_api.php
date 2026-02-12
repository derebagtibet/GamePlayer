<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }
header("Content-Type: application/json; charset=UTF-8");

if (file_exists(__DIR__ . '/db.php')) { require_once __DIR__ . '/db.php'; } 
elseif (file_exists(__DIR__ . '/../db.php')) { require_once __DIR__ . '/../db.php'; } 
else { die(json_encode(["status" => "error", "message" => "db.php bulunamadı"])); }

$current_user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if ($current_user_id <= 0) { echo json_encode([]); exit; }
    $filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';
    $sql = "SELECT * FROM notifications WHERE user_id = ?";
    if ($filter == 'invites') $sql .= " AND type = 'invite'";
    elseif ($filter == 'system') $sql .= " AND type IN ('system', 'alert')";
    $sql .= " ORDER BY created_at DESC";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$current_user_id]);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    $endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';
    
    if ($endpoint == 'accept' && isset($data->notification_id) && $current_user_id > 0) {
        try {
            $pdo->beginTransaction();
            
            // 1. Bildirimi bul ve etkinlik ID'sini al (related_id varsa)
            // Not: Notification tablosunda related_id yoksa eklenmeli veya title/message'dan parse edilmeli.
            // Varsayım: related_id sütunu var. dbokuveri.sql'de 'related_id' sütunu var.
            
            $stmt = $pdo->prepare("SELECT related_id, type FROM notifications WHERE id = ? AND user_id = ?");
            $stmt->execute([$data->notification_id, $current_user_id]);
            $notif = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($notif && $notif['type'] == 'invite' && $notif['related_id']) {
                // 2. Etkinliğe katıl
                $stmt_join = $pdo->prepare("INSERT INTO event_participants (event_id, user_id, status) VALUES (?, ?, 'joined') ON DUPLICATE KEY UPDATE status='joined'");
                $stmt_join->execute([$notif['related_id'], $current_user_id]);
            }
            
            // 3. Bildirimi okundu yap
            $pdo->prepare("UPDATE notifications SET is_read = 1 WHERE id = ?")->execute([$data->notification_id]);
            
            $pdo->commit();
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } elseif ($endpoint == 'send_invite' && isset($data->username) && $current_user_id > 0) {
        try {
            // Kullanıcıyı bul
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$data->username]);
            $target_user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($target_user) {
                // Bildirim gönder
                $title = "Maç Daveti";
                $message = isset($data->message) ? $data->message : "Seni bir maça davet etti.";
                $related_id = isset($data->event_id) ? $data->event_id : null;
                
                $sql = "INSERT INTO notifications (user_id, type, title, message, related_id, is_read) VALUES (?, 'invite', ?, ?, ?, 0)";
                $pdo->prepare($sql)->execute([$target_user['id'], $title, $message, $related_id]);
                
                echo json_encode(["status" => "success", "message" => "Davet gönderildi"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Kullanıcı bulunamadı"]);
            }
        } catch (PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
    }
}
?>