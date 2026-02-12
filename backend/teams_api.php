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

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (isset($data->name) && isset($data->captain_id)) {
        try {
            $pdo->beginTransaction();
            
            // 1. Takımı oluştur
            $sql = "INSERT INTO teams (name, captain_id, description, logo_url) VALUES (?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $data->name,
                $data->captain_id,
                $data->description ?? '',
                $data->logo_url ?? 'https://ui-avatars.com/api/?name=' . urlencode($data->name)
            ]);
            $team_id = $pdo->lastInsertId();
            
            // 2. Kaptanı üye olarak ekle
            $sql_member = "INSERT INTO team_members (team_id, user_id, role) VALUES (?, ?, 'Captain')";
            $pdo->prepare($sql_member)->execute([$team_id, $data->captain_id]);
            
            $pdo->commit();
            echo json_encode(["status" => "success", "team_id" => $team_id]);
        } catch (PDOException $e) {
            $pdo->rollBack();
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Eksik veriler"]);
    }
} elseif ($method == 'GET') {
    // Takımları listele
    try {
        $stmt = $pdo->query("SELECT * FROM teams ORDER BY created_at DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>