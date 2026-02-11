import { Platform } from 'react-native';

// Kendi yerel IP adresinizi buraya yazın (ipconfig komutu ile bulabilirsiniz)
// Android Emulator için 10.0.2.2 kullanın
// iOS Simulator veya Web için localhost kullanın
const DEV_IP = '10.73.127.235'; 

export const API_URL = Platform.select({
  android: `http://10.0.2.2:8000/api.php`,
  ios: `http://localhost:8000/api.php`,
  web: `http://localhost:8000/api.php`,
  default: `http://${DEV_IP}:8000/api.php`,
});

// Eğer fiziksel cihazda test ediyorsanız, yukarıdaki default kısmını veya 
// direkt API_URL değerini kendi IP adresinizle değiştirin.
// Örnek: export const API_URL = 'http://192.168.1.100:8000/api.php';
