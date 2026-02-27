import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { API_URL } from '@/constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#17da62',
  backgroundLight: '#f6f8f7',
  backgroundDark: '#112117',
  textLight: '#111418',
  textDark: '#ffffff',
  gray: '#617589',
  grayLight: '#e5e7eb',
  grayDark: '#374151',
  white: '#ffffff',
  glassLight: 'rgba(255, 255, 255, 0.75)',
  glassDark: 'rgba(16, 25, 34, 0.75)',
};

export default function LoginScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const styles = getStyles(isDark);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/backend/login_api.php?endpoint=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        // Kullanıcı ID'sini kaydet
        await AsyncStorage.setItem('user_id', data.user.id.toString());
        await AsyncStorage.setItem('user_name', data.user.full_name || '');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Hata', data.message);
      }
    } catch (error) {
      Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      Alert.alert('Uyarı', 'Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/backend/login_api.php?endpoint=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const data = await response.json();

      if (data.status === 'success') {
        // Kayıt sonrası otomatik login yapmak için ID'yi kaydet
        await AsyncStorage.setItem('user_id', data.user_id.toString());
        await AsyncStorage.setItem('user_name', fullName);
        Alert.alert('Başarılı', 'Kayıt olundu!', [
            { text: 'Devam Et', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        Alert.alert('Hata', data.message);
      }
    } catch (error) {
      Alert.alert('Hata', 'Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <View style={styles.logoBox}>
              <MaterialIcons name="sports-soccer" size={20} color="white" />
            </View>
            <Text style={styles.brandText}>SporMatch</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.helpText}>Yardım</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Oyuna Dahil Ol</Text>
            <Text style={styles.welcomeSubtitle}>
              Eksik oyuncu kalmasın. Hemen katıl, takımını kur ve maçın keyfini çıkar.
            </Text>
          </View>

          {/* Glass Panel */}
          <View style={styles.glassPanel}>
            {/* Tabs */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'login' && styles.activeTab]}
                onPress={() => setActiveTab('login')}
              >
                <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
                  Giriş Yap
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'register' && styles.activeTab]}
                onPress={() => setActiveTab('register')}
              >
                <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
                  Kayıt Ol
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'login' ? (
              <View style={styles.form}>
                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>E-posta veya Kullanıcı Adı</Text>
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="mail" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="ornek@mail.com"
                      placeholderTextColor="#9ca3af"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Şifre</Text>
                  <View style={styles.inputContainer}>
                    <MaterialIcons name="lock" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>
                </View>

                {/* Remember Me & Forgot Password */}
                <View style={styles.rowBetween}>
                  <TouchableOpacity style={styles.row}>
                    <View style={styles.checkbox} />
                    <Text style={styles.rememberMeText}>Beni Hatırla</Text>
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Text style={styles.forgotPasswordText}>Şifremi unuttum?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button */}
                <TouchableOpacity style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text style={styles.primaryButtonText}>Giriş Yap</Text>
                      <MaterialIcons name="login" size={20} color="white" />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.form}>
                 {/* Register Form */}
                 <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ad Soyad</Text>
                    <TextInput 
                        style={[styles.input, {paddingLeft: 16}]} 
                        placeholder="Ahmet Yılmaz" 
                        placeholderTextColor="#9ca3af"
                        value={fullName}
                        onChangeText={setFullName}
                    />
                 </View>

                 <View style={styles.inputGroup}>
                    <Text style={styles.label}>E-posta</Text>
                    <TextInput 
                        style={[styles.input, {paddingLeft: 16}]} 
                        placeholder="ornek@mail.com" 
                        placeholderTextColor="#9ca3af"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />
                 </View>

                 <View style={styles.inputGroup}>
                    <Text style={styles.label}>Şifre</Text>
                    <TextInput 
                        style={[styles.input, {paddingLeft: 16}]} 
                        placeholder="••••••••" 
                        placeholderTextColor="#9ca3af"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                 </View>

                 <TouchableOpacity style={[styles.primaryButton, {marginTop: 8}]} onPress={handleRegister} disabled={loading}>
                   {loading ? (
                     <ActivityIndicator color="white" />
                   ) : (
                     <Text style={styles.primaryButtonText}>Kayıt Ol</Text>
                   )}
                </TouchableOpacity>
              </View>
            )}

            {/* Social Separator */}
            <View style={styles.separatorContainer}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>veya şununla devam et</Text>
            </View>

            {/* Social Login */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialButton}>
                {/* Placeholder for Google Logo */}
                <View style={{width: 20, height: 20, backgroundColor: '#DB4437', borderRadius: 10, marginRight: 8}} />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                {/* Placeholder for Facebook Logo */}
                <View style={{width: 20, height: 20, backgroundColor: '#4267B2', borderRadius: 10, marginRight: 8}} />
                <Text style={styles.socialButtonText}>Facebook</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer Benefits */}
        <View style={styles.footer}>
            <View style={styles.footerItem}>
                <View style={styles.footerIconBox}>
                    <MaterialIcons name="bolt" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.footerText}>Hızlı Maç</Text>
            </View>
            <View style={styles.footerItem}>
                <View style={styles.footerIconBox}>
                    <MaterialIcons name="group-add" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.footerText}>Takım Kur</Text>
            </View>
            <View style={styles.footerItem}>
                <View style={styles.footerIconBox}>
                    <MaterialIcons name="forum" size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.footerText}>Sosyalleş</Text>
            </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
  },
  scrollContainer: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60, // Safe area top
    paddingBottom: 8,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  mainContent: {
    padding: 16,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  welcomeSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: isDark ? COLORS.textDark : COLORS.textLight,
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  glassPanel: {
    backgroundColor: isDark ? COLORS.glassDark : COLORS.glassLight,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
    // Shadow simulation
    shadowColor: '#1f2687',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 32,
    elevation: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: isDark ? '#374151' : COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  activeTabText: {
    color: isDark ? COLORS.white : COLORS.primary,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#e5e7eb' : COLORS.textLight,
    marginLeft: 4,
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    width: '100%',
    paddingVertical: 14,
    paddingLeft: 44,
    paddingRight: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : COLORS.grayLight,
    backgroundColor: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.5)',
    color: isDark ? COLORS.white : COLORS.textLight,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowGap: {
      flexDirection: 'row',
      gap: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.grayLight,
  },
  rememberMeText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 32,
    position: 'relative',
  },
  separatorLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: isDark ? '#374151' : COLORS.grayLight,
  },
  separatorText: {
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight, // Should match bg
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gray,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? '#374151' : COLORS.grayLight,
    backgroundColor: isDark ? '#1f2937' : COLORS.white,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: isDark ? COLORS.white : COLORS.textLight,
  },
  chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? '#374151' : '#e5e7eb',
      backgroundColor: isDark ? '#1f2937' : 'white',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
  },
  chipActive: {
      borderColor: COLORS.primary,
      backgroundColor: COLORS.primary,
  },
  chipText: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#d1d5db' : '#4b5563',
  },
  chipTextActive: {
      color: 'white',
      fontWeight: 'bold',
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      marginTop: 16,
  },
  footerItem: {
      alignItems: 'center',
      gap: 4,
      flex: 1,
  },
  footerIconBox: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDark ? '#1f2937' : 'white',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
  },
  footerText: {
      fontSize: 10,
      fontWeight: 'bold',
      color: COLORS.gray,
      textTransform: 'uppercase',
  },
});
