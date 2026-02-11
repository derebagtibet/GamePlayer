<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// Options isteğine hemen yanıt ver (CORS için)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$dbFile = __DIR__ . '/db.json';

// Veritabanını oku
if (!file_exists($dbFile)) {
    http_response_code(404);
    echo json_encode(["error" => "Database file not found"]);
    exit();
}

$content = file_get_contents($dbFile);
$data = json_decode($content, true);

if ($data === null) {
    http_response_code(500);
    echo json_encode(["error" => "Invalid JSON in database file"]);
    exit();
}

// Hangi verinin istendiğini kontrol et (?endpoint=profile gibi)
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : 'explore';

if ($endpoint === 'profile') {
    echo json_encode($data['profile'] ?? []);
} elseif ($endpoint === 'matches') {
    echo json_encode($data['matches'] ?? []);
} elseif ($endpoint === 'dashboard') {
    echo json_encode($data['dashboard'] ?? []);
} else {
    // Varsayılan olarak explore (keşfet) verilerini döndür
    echo json_encode($data['explore'] ?? []);
}
?>