<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }
header("Content-Type: application/json; charset=UTF-8");

if (file_exists(__DIR__ . '/db.php')) { require_once __DIR__ . '/db.php'; } 
elseif (file_exists(__DIR__ . '/../db.php')) { require_once __DIR__ . '/../db.php'; } 
else { die(json_encode(["status" => "error", "message" => "db.php bulunamadı"])); }

$method = $_SERVER['REQUEST_METHOD'];
$current_user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($method == 'GET') {
    if (isset($_GET['event_id'])) {
        $event_id = intval($_GET['event_id']);
        
        try {
            // 1. Etkinlik ana verisi
            $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
            $stmt->execute([$event_id]);
            $event = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$event) { die(json_encode(["status" => "error", "message" => "Etkinlik bulunamadı"])); }
            
            // 2. Katılımcılar
            $sql_p = "
                SELECT u.id, u.full_name as name, u.avatar_url, u.position, ep.status
                FROM event_participants ep
                JOIN users u ON ep.user_id = u.id
                WHERE ep.event_id = ?
            ";
            $stmt_p = $pdo->prepare($sql_p);
            $stmt_p->execute([$event_id]);
            $participants = $stmt_p->fetchAll(PDO::FETCH_ASSOC);
            
            // Organizatör kontrolünü PHP tarafında yap (daha güvenli)
            foreach ($participants as &$p) {
                $p['is_organizer'] = ($p['id'] == $event['organizer_id']) ? 1 : 0;
            }
            
            echo json_encode([
                "status" => "success",
                "event" => $event,
                "participants" => $participants
            ]);
            
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "event_id gerekli"]);
    }
}
?>