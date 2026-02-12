<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

require '../db.php'; // Veritabanı bağlantı dosyanızın yolu

$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') {
    // Tüm kullanıcıları getir (veya ?id=1 ile tek kullanıcı)
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT id, username, email, full_name, avatar_url FROM users WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            echo json_encode(["status" => "success", "data" => $user]);
        } else {
            echo json_encode(["status" => "error", "message" => "Kullanıcı bulunamadı"]);
        }
    } else {
        $stmt = $pdo->query("SELECT id, username, email, full_name, avatar_url FROM users");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["status" => "success", "data" => $users]);
    }
} elseif ($method == 'POST') {
    // Yeni kullanıcı ekleme (Örnek)
    $data = json_decode(file_get_contents("php://input"));

    if(isset($data->username) && isset($data->email) && isset($data->password)) {
        $sql = "INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $password_hash = password_hash($data->password, PASSWORD_DEFAULT);
        
        try {
            $stmt->execute([$data->username, $data->email, $password_hash, $data->full_name ?? '']);
            echo json_encode(["status" => "success", "message" => "Kullanıcı oluşturuldu", "id" => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Kayıt başarısız: " . $e->getMessage()]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Eksik veri"]);
    }
} elseif ($method == 'PUT') {
    // Token güncelleme
    $data = json_decode(file_get_contents("php://input"));
    if (isset($data->id) && isset($data->push_token)) {
        try {
            // push_token sütunu yoksa hata verebilir, SQL ile eklenmeli
            $sql = "UPDATE users SET push_token = ? WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$data->push_token, $data->id]);
            echo json_encode(["status" => "success", "message" => "Token güncellendi"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Güncelleme hatası: " . $e->getMessage()]);
        }
    }
} else {
    echo json_encode(["status" => "error", "message" => "Geçersiz metod"]);
}
?>