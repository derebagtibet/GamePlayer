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
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
        $stmt->execute([$current_user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            $response = [
                'id' => $user['id'], 'name' => $user['full_name'], 'username' => $user['username'],
                'position' => $user['position'], 'level' => $user['level'], 'status' => $user['status'],
                'avatar' => $user['avatar_url'], 'cover' => $user['cover_url'], 'stats' => [
                    'matches' => $user['matches_played'], 'goals' => $user['goals'],
                    'assists' => $user['assists'], 'fairplay' => $user['fairplay_score']
                ], 'history' => []
            ];
            $h_stmt = $pdo->prepare("
                SELECT e.id, e.title, e.category as subtitle, DATE_FORMAT(e.event_date, '%d %M') as date, e.icon, 'white' as color, e.image_url 
                FROM events e 
                JOIN event_participants ep ON e.id = ep.event_id 
                WHERE ep.user_id = ? AND e.status = 'past' 
                ORDER BY e.event_date DESC LIMIT 5
            ");
            $h_stmt->execute([$current_user_id]);
            $response['history'] = $h_stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($response);
        } else { echo json_encode(["status" => "error", "message" => "Kullanıcı bulunamadı"]); }
    } catch (PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if ($current_user_id > 0) {
        try {
            // Sütun yoksa ekle (sessizce)
            try { $pdo->exec("ALTER TABLE users ADD COLUMN cover_url VARCHAR(255) DEFAULT NULL"); } catch (Exception $e) {}

            $sql = "UPDATE users SET full_name = ?, position = ?, bio = ? WHERE id = ?";
            $params = [
                $data->full_name ?? '',
                $data->position ?? 'Oyuncu',
                $data->bio ?? '',
                $current_user_id
            ];
            
            // Avatar ve Kapak güncelleme
            $extra_sql = "";
            if (isset($data->avatar_url) && !empty($data->avatar_url)) {
                $extra_sql .= ", avatar_url = ?";
                $params[] = $data->avatar_url;
            }
            if (isset($data->cover_url) && !empty($data->cover_url)) {
                $extra_sql .= ", cover_url = ?";
                $params[] = $data->cover_url;
            }
            
            // SQL'i yeniden oluştur
            // params sırası önemli: full_name, position, bio, [avatar], [cover], id
            // Mevcut params'dan id'yi çıkarıp sona eklemeliyiz
            array_pop($params); // id'yi çıkar
            if (isset($data->avatar_url) && !empty($data->avatar_url)) $params[] = $data->avatar_url;
            if (isset($data->cover_url) && !empty($data->cover_url)) $params[] = $data->cover_url;
            $params[] = $current_user_id; // id'yi geri ekle

            $sql = "UPDATE users SET full_name = ?, position = ?, bio = ?" . $extra_sql . " WHERE id = ?";
            
            $pdo->prepare($sql)->execute($params);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
    } else {
        echo json_encode(["status" => "error", "message" => "Oturum açılmamış"]);
    }
}
?>