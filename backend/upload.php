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
    $original_name = basename($_FILES["file"]["name"]);
    $imageFileType = strtolower(pathinfo($original_name, PATHINFO_EXTENSION));
    
    // Uzantı yoksa veya hatalıysa varsayılan olarak jpg yap
    if (!$imageFileType) $imageFileType = "jpg";
    
    $new_filename = uniqid() . '.' . $imageFileType;
    $target_path = $target_dir . $new_filename;
    
    // Check if image file is a actual image or fake image
    $check = getimagesize($_FILES["file"]["tmp_name"]);
    if($check !== false) {
        if (move_uploaded_file($_FILES["file"]["tmp_name"], $target_path)) {
            // Sunucu URL'ini oluştur
            $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
            $host = $_SERVER['HTTP_HOST'];
            
            // dirname Windows'ta ters slash verebilir, onu düzeltelim
            $script_path = str_replace('\\', '/', dirname($_SERVER['PHP_SELF']));
            
            // Eğer script_path sadece / ise (root), çift slash olmasın
            if ($script_path == '/') $script_path = '';
            
            $full_url = $protocol . "://" . $host . $script_path . "/" . $target_path;
            
            echo json_encode(["status" => "success", "url" => $full_url]);
        } else {
            echo json_encode(["status" => "error", "message" => "Dosya yüklenirken hata oluştu (move_uploaded_file failed)."]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Dosya geçerli bir resim değil."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Dosya bulunamadı veya POST isteği değil."]);
}
?>