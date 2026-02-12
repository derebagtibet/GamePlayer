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
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : 'list';

if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    if ($current_user_id <= 0) { echo json_encode([]); exit; }
    if ($endpoint == 'list') {
        $sql = "
            SELECT 
                c.id, 
                c.type, 
                c.last_message, 
                DATE_FORMAT(c.last_message_time, '%H:%i') as time,
                CASE 
                    WHEN c.type = 'direct' THEN u.full_name 
                    ELSE c.name 
                END as title,
                CASE 
                    WHEN c.type = 'direct' THEN u.avatar_url 
                    ELSE c.image_url 
                END as avatar,
                (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND is_read = 0 AND sender_id != ?) as unread_count
            FROM conversations c 
            JOIN conversation_participants cp_me ON c.id = cp_me.conversation_id AND cp_me.user_id = ?
            LEFT JOIN conversation_participants cp_other ON c.id = cp_other.conversation_id AND cp_other.user_id != ? AND c.type = 'direct'
            LEFT JOIN users u ON cp_other.user_id = u.id
            ORDER BY c.last_message_time DESC
        ";
        try {
            $stmt = $pdo->prepare($sql); 
            $stmt->execute([$current_user_id, $current_user_id, $current_user_id]);
            $conversations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($conversations as &$c) {
                if (empty($c['avatar'])) {
                    $c['avatar'] = 'https://ui-avatars.com/api/?name=' . urlencode($c['title']) . '&background=random';
                }
            }
            
            echo json_encode($conversations);
        } catch (PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
    } elseif ($endpoint == 'detail' && isset($_GET['conversation_id'])) {
        $conv_id = intval($_GET['conversation_id']);
        
        // Mesajları okundu olarak işaretle
        try {
            $pdo->prepare("UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?")->execute([$conv_id, $current_user_id]);
        } catch (PDOException $e) { /* Hata olsa bile devam et */ }

        $sql = "SELECT m.id, m.content, m.created_at, m.sender_id, u.full_name as sender_name, u.avatar_url as sender_avatar,
                CASE WHEN m.sender_id = ? THEN 1 ELSE 0 END as is_me FROM messages m JOIN users u ON m.sender_id = u.id
                WHERE m.conversation_id = ? ORDER BY m.created_at ASC";
        try {
            $stmt = $pdo->prepare($sql); $stmt->execute([$current_user_id, $conv_id]);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } catch (PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
    } elseif ($endpoint == 'group_info' && isset($_GET['conversation_id'])) {
        $conv_id = intval($_GET['conversation_id']);
        $stmt = $pdo->prepare("SELECT * FROM conversations WHERE id = ?");
        $stmt->execute([$conv_id]);
        $group = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $stmt_p = $pdo->prepare("SELECT u.id, u.username, u.full_name, u.avatar_url FROM conversation_participants cp JOIN users u ON cp.user_id = u.id WHERE cp.conversation_id = ?");
        $stmt_p->execute([$conv_id]);
        $participants = $stmt_p->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(["group" => $group, "participants" => $participants]);
    }
} elseif ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if ($endpoint == 'send_message') {
        if (isset($data->conversation_id) && isset($data->content) && isset($data->sender_id)) {
            try {
                $pdo->beginTransaction();
                $stmt = $pdo->prepare("INSERT INTO messages (conversation_id, sender_id, content, is_read) VALUES (?, ?, ?, 0)");
                $stmt->execute([$data->conversation_id, $data->sender_id, $data->content]);
                $last_id = $pdo->lastInsertId();
                
                // Konuşmayı güncelle
                $pdo->prepare("UPDATE conversations SET last_message = ?, last_message_time = NOW() WHERE id = ?")->execute([$data->content, $data->conversation_id]);
                
                $pdo->commit();
                echo json_encode(["status" => "success", "message_id" => $last_id]);
            } catch (PDOException $e) {
                $pdo->rollBack();
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        }
    } elseif ($endpoint == 'create_conversation') {
        // Yeni sohbet/grup oluştur
        if (isset($data->participants) && is_array($data->participants)) {
            try {
                $pdo->beginTransaction();
                $type = count($data->participants) > 2 ? 'group' : 'direct';
                
                // Eğer direct ise ve 2 kişi varsa, var olanı kontrol et
                if ($type == 'direct' && count($data->participants) == 2) {
                    $u1 = $data->participants[0];
                    $u2 = $data->participants[1];
                    // İki kullanıcının ortak olduğu direct conversation var mı?
                    $stmt_check = $pdo->prepare("
                        SELECT c.id FROM conversations c
                        JOIN conversation_participants cp1 ON c.id = cp1.conversation_id
                        JOIN conversation_participants cp2 ON c.id = cp2.conversation_id
                        WHERE c.type = 'direct' AND cp1.user_id = ? AND cp2.user_id = ?
                        LIMIT 1
                    ");
                    $stmt_check->execute([$u1, $u2]);
                    $existing = $stmt_check->fetch(PDO::FETCH_ASSOC);
                    
                    if ($existing) {
                        $pdo->commit();
                        echo json_encode(["status" => "success", "conversation_id" => $existing['id']]);
                        exit;
                    }
                }

                $name = isset($data->name) ? $data->name : ($type == 'group' ? 'Yeni Grup' : null);
                
                // Grup için varsayılan resim
                $image_url = null;
                if ($type == 'group') {
                    $image_url = isset($data->image_url) && !empty($data->image_url) ? $data->image_url : 'https://ui-avatars.com/api/?name=' . urlencode($name) . '&background=random';
                }

                // Konuşmayı oluştur
                $stmt = $pdo->prepare("INSERT INTO conversations (type, name, image_url, last_message, last_message_time) VALUES (?, ?, ?, 'Sohbet başlatıldı', NOW())");
                $stmt->execute([$type, $name, $image_url]);
                $conv_id = $pdo->lastInsertId();
                
                // Katılımcıları ekle
                $stmt_p = $pdo->prepare("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)");
                foreach ($data->participants as $uid) {
                    $stmt_p->execute([$conv_id, $uid]);
                }
                
                $pdo->commit();
                echo json_encode(["status" => "success", "conversation_id" => $conv_id]);
            } catch (PDOException $e) {
                $pdo->rollBack();
                echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            }
        }
    } elseif ($endpoint == 'update_group') {
        if (isset($data->conversation_id) && isset($data->name)) {
            $pdo->prepare("UPDATE conversations SET name = ? WHERE id = ?")->execute([$data->name, $data->conversation_id]);
            echo json_encode(["status" => "success"]);
        }
    } elseif ($endpoint == 'add_member') {
        if (isset($data->conversation_id) && isset($data->username)) {
            // Kullanıcıyı bul
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$data->username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                try {
                    $pdo->prepare("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)")->execute([$data->conversation_id, $user['id']]);
                    echo json_encode(["status" => "success"]);
                } catch (PDOException $e) { echo json_encode(["status" => "error", "message" => "Kullanıcı zaten ekli"]); }
            } else {
                echo json_encode(["status" => "error", "message" => "Kullanıcı bulunamadı"]);
            }
        }
    } elseif ($endpoint == 'remove_member') {
        if (isset($data->conversation_id) && isset($data->user_id)) {
            $pdo->prepare("DELETE FROM conversation_participants WHERE conversation_id = ? AND user_id = ?")->execute([$data->conversation_id, $data->user_id]);
            echo json_encode(["status" => "success"]);
        }
    } elseif ($endpoint == 'mark_read') {
        if (isset($data->conversation_id) && isset($data->user_id)) {
             $pdo->prepare("UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?")->execute([$data->conversation_id, $data->user_id]);
             echo json_encode(["status" => "success"]);
        }
    }
}
?>