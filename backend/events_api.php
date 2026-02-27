<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }
header("Content-Type: application/json; charset=UTF-8");

// Hata raporlamayı açalım (Geliştirme aşamasında)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (file_exists(__DIR__ . '/db.php')) { require_once __DIR__ . '/db.php'; } 
elseif (file_exists(__DIR__ . '/../db.php')) { require_once __DIR__ . '/../db.php'; } 
else { die(json_encode(["status" => "error", "message" => "db.php bulunamadı"])); }

$method = $_SERVER['REQUEST_METHOD'];
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';
$current_user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

// Otomatik Kapanma
try {
    $pdo->query("UPDATE events SET status = 'past' WHERE status = 'upcoming' AND event_date < NOW()");
} catch (Exception $e) {}

if ($method == 'GET') {
    // ... (GET işlemleri aynı kalabilir, sadece user_id kontrolünü iyileştirelim)
    if ($endpoint == 'dashboard') {
        if ($current_user_id <= 0) { echo json_encode(["notifications" => 0, "teams_looking" => [], "activities" => []]); exit; }
        try {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0");
            $stmt->execute([$current_user_id]);
            $notif_count = $stmt->fetchColumn();
            
            $stmt_e = $pdo->query("SELECT id, title as name, location as distance, CONCAT(current_participants, '/', max_participants, ' OYUNCU') as need, 'urgent' as type FROM events WHERE status = 'upcoming' AND current_participants < max_participants LIMIT 2");
            $teams_looking = $stmt_e->fetchAll(PDO::FETCH_ASSOC);

            $stmt_n = $pdo->prepare("SELECT id, type, title, message as text, created_at as time FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5");
            $stmt_n->execute([$current_user_id]);
            $db_activities = $stmt_n->fetchAll(PDO::FETCH_ASSOC);
            
            $activities = [];
            foreach ($db_activities as $act) {
                $time_diff = time() - strtotime($act['time']);
                if ($time_diff < 60) { $time_str = "Şimdi"; }
                elseif ($time_diff < 3600) { $time_str = floor($time_diff / 60) . " dk önce"; }
                elseif ($time_diff < 86400) { $time_str = floor($time_diff / 3600) . " sa önce"; }
                else { $time_str = date("d.m", strtotime($act['time'])); }

                $item = [
                    "id" => $act['id'],
                    "type" => $act['type'] == 'invite' ? 'invite' : 'system',
                    "text" => $act['text'],
                    "time" => $time_str,
                    "icon" => ($act['type'] == 'alert' ? 'warning' : ($act['type'] == 'system' ? 'info' : 'notifications'))
                ];
                if ($act['type'] == 'invite') $item['avatar'] = "Admin";
                $activities[] = $item;
            }

            $stmt_upcoming = $pdo->query("SELECT id, title, DATE_FORMAT(event_date, '%H:%i') as time, location, image_url as bgImage FROM events WHERE status = 'upcoming' LIMIT 5");
            $upcoming_events = $stmt_upcoming->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "notifications" => (int)$notif_count,
                "teams_looking" => $teams_looking,
                "activities" => $activities,
                "upcoming_events" => $upcoming_events
            ]);
        } catch (PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
    
    } elseif ($endpoint == 'matches') {
        $sql_u = "
            SELECT e.id, e.title, e.location, DATE_FORMAT(e.event_date, '%H:%i') as time, 
            CASE WHEN DATE(e.event_date) = CURDATE() THEN 'Bugün' ELSE DATE_FORMAT(e.event_date, '%d.%m.%Y') END as date, 
            e.icon, e.category, 
            CASE WHEN e.organizer_id = ? THEN 'OLUŞTURAN' ELSE 'KATILIMCI' END as role,
            (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id AND status = 'joined') as current_p,
            e.max_participants as max_p
            FROM events e 
            JOIN event_participants ep ON e.id = ep.event_id
            WHERE ep.user_id = ? AND e.status = 'upcoming' 
            ORDER BY e.event_date ASC";
            
        $sql_p = "
            SELECT e.id, e.title, e.location, DATE_FORMAT(e.event_date, '%d.%m.%Y') as date, e.icon, mr.score, mr.result 
            FROM events e 
            JOIN event_participants ep ON e.id = ep.event_id
            LEFT JOIN match_results mr ON e.id = mr.event_id 
            WHERE ep.user_id = ? AND e.status = 'past' 
            ORDER BY e.event_date DESC";

        try {
            $stmt_u = $pdo->prepare($sql_u);
            $stmt_u->execute([$current_user_id, $current_user_id]);
            $upcoming = $stmt_u->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($upcoming as &$m) {
                $m['participants'] = $m['current_p'] . '/' . $m['max_p'];
                $m['avatars'] = ['User'];
                $m['moreCount'] = $m['current_p'] > 1 ? '+' . ($m['current_p'] - 1) : null;
            }

            $stmt_p = $pdo->prepare($sql_p);
            $stmt_p->execute([$current_user_id]);
            $past = $stmt_p->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["upcoming" => $upcoming, "past" => $past]);
        } catch (PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }

    } elseif ($endpoint == 'explore') {
        $category = isset($_GET['category']) ? $_GET['category'] : '';
        $sql = "SELECT e.id, e.type as event_type, e.category, e.title, e.subtitle, DATE_FORMAT(e.event_date, '%H:%i') as time_only, e.location, 
                (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id AND status = 'joined') as current_p,
                e.max_participants as max_p,
                e.price, e.badge_text as badge, e.icon, e.image_url as image, 
                CASE WHEN e.image_url IS NOT NULL AND e.image_url != '' THEN 1 ELSE 0 END as isImageCard,
                CASE WHEN EXISTS(SELECT 1 FROM event_participants WHERE event_id = e.id AND user_id = ?) THEN 1 ELSE 0 END as is_joined
                FROM events e WHERE e.status = 'upcoming'";
        
        if ($category != '' && $category != 'Tümü') {
            $sql .= " AND e.category = " . $pdo->quote($category);
        }

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$current_user_id]);
            $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $res = [];
            foreach ($events as $e) {
                $progress = ($e['max_p'] > 0) ? round(($e['current_p'] / $e['max_p']) * 100) : 0;
                $res[] = [
                    'id' => $e['id'], 'type' => strtolower($e['event_type'] ?? 'soccer'), 'category' => $e['category'], 'title' => $e['title'],
                    'subtitle' => $e['subtitle'], 'time' => $e['time_only'], 'location' => $e['location'], 
                    'participants' => $e['current_p'] . '/' . $e['max_p'],
                    'progress' => $progress . '%', 'price' => $e['price'] > 0 ? '₺' . $e['price'] : 'Ücretsiz', 'badge' => $e['badge'],
                    'icon' => $e['icon'], 'image' => $e['image'], 'isImageCard' => (bool)$e['isImageCard'], 
                    'iconColor' => '#15803d', 'iconBg' => '#f0fdf4',
                    'is_joined' => (bool)$e['is_joined']
                ];
            }
            echo json_encode($res);
        } catch (PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
    }
} elseif ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if ($current_user_id <= 0 && isset($data->user_id)) {
        $current_user_id = intval($data->user_id);
    }
    
    if ($endpoint == 'join') {
        if (isset($data->event_id) && $current_user_id > 0) {
            try {
                // Sütun kontrolü (isteğe bağlı)
                $sql = "INSERT INTO event_participants (event_id, user_id, status, position) VALUES (?, ?, 'joined', ?) 
                        ON DUPLICATE KEY UPDATE status='joined', position = VALUES(position)";
                $pdo->prepare($sql)->execute([$data->event_id, $current_user_id, $data->position ?? null]);
                echo json_encode(["status" => "success"]);
            } catch (PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
        }
    } elseif ($endpoint == 'leave') {
        if (isset($data->event_id) && $current_user_id > 0) {
            try {
                $sql = "DELETE FROM event_participants WHERE event_id = ? AND user_id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$data->event_id, $current_user_id]);
                echo json_encode(["status" => "success"]);
            } catch (PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
        }
    } elseif ($endpoint == 'save_result') {
        // ... (save_result logic) ...
        // Kodun tamamı değişmesin diye burayı kısa tuttum, mevcut halini kullanacağız.
        // Ancak yukarıdaki full read_file içeriğini tekrar yazmam gerekecek.
        if (isset($data->event_id) && isset($data->score) && $current_user_id > 0) {
            try {
                $stmt = $pdo->prepare("SELECT organizer_id FROM events WHERE id = ?");
                $stmt->execute([$data->event_id]);
                $event = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($event && $event['organizer_id'] == $current_user_id) {
                    $sql = "INSERT INTO match_results (event_id, score, result, details) VALUES (?, ?, ?, ?) 
                            ON DUPLICATE KEY UPDATE score = VALUES(score), result = VALUES(result), details = VALUES(details)";
                    $pdo->prepare($sql)->execute([$data->event_id, $data->score, $data->result ?? 'DRAW', $data->details ?? '']);
                    $pdo->prepare("UPDATE events SET status = 'past' WHERE id = ?")->execute([$data->event_id]);
                    echo json_encode(["status" => "success"]);
                } else { echo json_encode(["status" => "error", "message" => "Yetkisiz işlem"]); }
            } catch (PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
        }
    } else {
        // Create Event - DÜZELTME BURADA
        if(isset($data->title) && isset($data->date)) {
            // Price sayısal kontrolden geçirilmeli
            $price = isset($data->price) && is_numeric($data->price) ? $data->price : 0;
            
            $sql = "INSERT INTO events (organizer_id, title, category, event_date, location, description, price, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            try {
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $current_user_id, 
                    $data->title, 
                    $data->category ?? 'Futbol', 
                    $data->date, 
                    $data->location, 
                    $data->description ?? '', 
                    $price, 
                    $data->type ?? 'friendly'
                ]);
                $event_id = $pdo->lastInsertId();
                $pdo->prepare("INSERT INTO event_participants (event_id, user_id, status) VALUES (?, ?, 'joined')")->execute([$event_id, $current_user_id]);
                echo json_encode(["status" => "success", "id" => $event_id]);
            } catch (PDOException $e) { 
                echo json_encode(["status" => "error", "message" => "SQL Hatası: " . $e->getMessage()]); 
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Eksik parametreler (title veya date)"]);
        }
    }
}
?>
