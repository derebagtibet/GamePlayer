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
                'id' => $user['id'],
                'name' => $user['full_name'],
                'username' => $user['username'],
                'email' => $user['email'],
                'position' => $user['position'],
                'level' => $user['level'],
                'status' => $user['status'],
                'avatar' => $user['avatar_url'],
                'bio' => $user['bio'],
                'phone' => $user['phone'] ?? '',
                'birth_date' => $user['birth_date'] ?? '',
                'gender' => $user['gender'] ?? '',
                'instagram' => $user['instagram'] ?? '',
                'twitter' => $user['twitter'] ?? '',
                'tiktok' => $user['tiktok'] ?? '',
                'stats' => [
                    'matches' => $user['matches_played'],
                    'goals' => $user['goals'],
                    'assists' => $user['assists'],
                    'fairplay' => $user['fairplay_score']
                ],
                'history' => []
            ];
            
            // Son etkinlikleri getir
            $h_stmt = $pdo->prepare("SELECT e.id, e.title, e.category as subtitle, DATE_FORMAT(e.event_date, '%d %M') as date, e.icon, 'white' as color 
                                   FROM events e 
                                   JOIN event_participants ep ON e.id = ep.event_id 
                                   WHERE ep.user_id = ? AND e.status = 'past' 
                                   ORDER BY e.event_date DESC LIMIT 5");
            $h_stmt->execute([$current_user_id]);
            $response['history'] = $h_stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($response);
        } else {
            echo json_encode(["status" => "error", "message" => "Kullanıcı bulunamadı"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!$data || !isset($data['id'])) {
        echo json_encode(["status" => "error", "message" => "Geçersiz veri"]);
        exit;
    }

    $id = intval($data['id']);
    $fields = [
        'full_name' => $data['name'] ?? null,
        'position' => $data['position'] ?? null,
        'level' => $data['level'] ?? null,
        'bio' => $data['bio'] ?? null,
        'avatar_url' => $data['avatar'] ?? null,
        'phone' => $data['phone'] ?? null,
        'birth_date' => $data['birth_date'] ?? null,
        'gender' => $data['gender'] ?? null,
        'instagram' => $data['instagram'] ?? null,
        'twitter' => $data['twitter'] ?? null,
        'tiktok' => $data['tiktok'] ?? null,
        'email' => $data['email'] ?? null
    ];

    try {
        $updates = [];
        $params = [];
        foreach ($fields as $column => $value) {
            if ($value !== null) {
                $updates[] = "$column = ?";
                $params[] = $value;
            }
        }

        if (empty($updates)) {
            echo json_encode(["status" => "error", "message" => "Güncellenecek veri yok"]);
            exit;
        }

        $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
        $params[] = $id;

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(["status" => "success", "message" => "Profil başarıyla güncellendi"]);
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Güncelleme hatası: " . $e->getMessage()]);
    }
}
?>