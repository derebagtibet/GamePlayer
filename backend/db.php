<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$host = 'localhost';
$dbname = 'trf1d1com_alsan';
$username = 'trf1d1com_sp486';
$password = 'sRt.1ygHNQTNf*M@';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Veritabanı yoksa oluşturmayı dene (Geliştirme ortamı için kolaylık)
    if (strpos($e->getMessage(), "Unknown database") !== false) {
        try {
            $pdo = new PDO("mysql:host=$host;charset=utf8", $username, $password);
            $pdo->exec("CREATE DATABASE `$dbname` CHARACTER SET utf8 COLLATE utf8_general_ci;");
            $pdo->exec("USE `$dbname`");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $ex) {
            die(json_encode(["status" => "error", "message" => "Veritabanı bağlantısı ve oluşturma başarısız: " . $ex->getMessage()]));
        }
    } else {
        die(json_encode(["status" => "error", "message" => "Veritabanı bağlantısı başarısız: " . $e->getMessage()]));
    }
}
?>