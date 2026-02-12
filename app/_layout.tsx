import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useRef } from 'react';
import 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { API_URL } from '@/constants/Config';

import { useColorScheme } from '@/hooks/use-color-scheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Notification Handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const unstable_settings = {
  anchor: '(tabs)',
};

function useProtectedRoute(isFontLoaded: boolean) {
  const segments = useSegments();
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    if (!isFontLoaded) return;

    const checkAuth = async () => {
      const userId = await AsyncStorage.getItem('user_id');
      const inAuthGroup = segments[0] === 'login';

      if (!userId && !inAuthGroup) {
        // Giriş yapmamışsa login ekranına at
        router.replace('/login');
      } else if (userId && inAuthGroup) {
        // Giriş yapmışsa ana sayfaya at
        router.replace('/(tabs)');
      }
      setIsAuthChecking(false);
    };

    checkAuth();
  }, [isFontLoaded, segments]);

  return isAuthChecking;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    // TODO: 'assets/fonts/Alsancak.ttf' dosyasını ekledikten sonra aşağıdaki satırı yorumdan çıkarın
    // 'Alsancak': require('../assets/fonts/Alsancak.ttf'),
  });

  const isAuthChecking = useProtectedRoute(loaded);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    if (loaded && !isAuthChecking) {
      SplashScreen.hideAsync();
      registerForPushNotificationsAsync().then(token => {
         if (token) savePushToken(token);
      });

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        // Bildirim geldiğinde yapılacaklar
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        // Bildirime tıklandığında yapılacaklar
        const data = response.notification.request.content.data;
        if (data?.url) {
           // router.push(data.url); // Navigation hazır olduğunda
        }
      });

      return () => {
        notificationListener.current && notificationListener.current.remove();
        responseListener.current && responseListener.current.remove();
      };
    }
  }, [loaded, isAuthChecking]);

  const savePushToken = async (token: string) => {
      try {
          const userId = await AsyncStorage.getItem('user_id');
          if (userId) {
              await fetch(`${API_URL}/backend/users_api.php`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: userId, push_token: token })
              });
          }
      } catch (e) {
          console.error('Token save error:', e);
      }
  };

  if (!loaded || isAuthChecking) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Cihaz kontrolü yapılabilir (Device.isDevice) ancak expo-device paketi yoksa hata verir.
  // Basitçe izin isteyelim.
  
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    // alert('Bildirim izni verilmedi!');
    return;
  }
  
  try {
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Expo Dashboard'dan alınmalı
      })).data;
  } catch (e) {
      console.log('Push token hatası:', e);
  }

  return token;
}
