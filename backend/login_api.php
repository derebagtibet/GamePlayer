<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

header("Content-Type: application/json; charset=UTF-8");

// Veritabanı dosyasını bulmaya çalış
if (file_exists(__DIR__ . '/db.php')) {
    require_once __DIR__ . '/db.php';
} elseif (file_exists(__DIR__ . '/../db.php')) {
    require_once __DIR__ . '/../db.php';
} else {
    die(json_encode([
        "status" => "error", 
        "message" => "db.php dosyası bulunamadı. Lütfen backend klasörüne veya bir üst klasöre db.php dosyasını yükleyin.",
        "debug_path" => __DIR__
    ]));
}

$method = $_SERVER['REQUEST_METHOD'];
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

if ($method == 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    if ($endpoint == 'login') {
        if (isset($data->email) && isset($data->password)) {
            $stmt = $pdo->prepare("SELECT id, username, password_hash, full_name FROM users WHERE email = ? OR username = ?");
            $stmt->execute([$data->email, $data->email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user && password_verify($data->password, $user['password_hash'])) {
                unset($user['password_hash']);
                echo json_encode(["status" => "success", "user" => $user]);
            } else { echo json_encode(["status" => "error", "message" => "E-posta veya şifre hatalı"]); }
        }
    } elseif ($endpoint == 'register') {
        if (isset($data->email) && isset($data->password) && isset($data->full_name)) {
            $password_hash = password_hash($data->password, PASSWORD_DEFAULT);
            $username = strtolower(explode('@', $data->email)[0]);
            try {
                $pdo->prepare("INSERT INTO users (username, email, password_hash, full_name, level, status) VALUES (?, ?, ?, ?, 'Baslangic', 'Onayli')")->execute([$username, $data->email, $password_hash, $data->full_name]);
                echo json_encode(["status" => "success", "user_id" => $pdo->lastInsertId()]);
            } catch (PDOException $e) { echo json_encode(["status" => "error", "message" => $e->getMessage()]); }
        }
    }
}
?>