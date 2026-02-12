<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit; }
header("Content-Type: application/json; charset=UTF-8");

$target_dir = "uploads/";
if (!file_exists($target_dir)) {
    mkdir($target_dir, 0777, true);
}

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_FILES["file"])) {
    $target_file = $target_dir . basename($_FILES["file"]["name"]);
    $imageFileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));
    $new_filename = uniqid() . '.' . $imageFileType;
    $target_path = $target_dir . $new_filename;
    
    // Check if image file is a actual image or fake image
    $check = getimagesize($_FILES["file"]["tmp_name"]);
    if($check !== false) {
        if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_path)) {
            // Sunucu URL'ini dinamik al veya sabit bir base URL kullan
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
            $host = $_SERVER['HTTP_HOST'];
            $script_path = dirname($_SERVER['PHP_SELF']);
            $full_url = $protocol . "://" . $host . $script_path . "/" . $target_path;
            
            echo json_encode(["status" => "success", "url" => $full_url]);
        } else {
            echo json_encode(["status" => "error", "message" => "Dosya yüklenirken hata oluştu."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Dosya bir resim değil."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Dosya bulunamadı."]);
}
?>