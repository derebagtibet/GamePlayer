import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  useColorScheme,
  StatusBar,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import { API_URL } from '@/constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const COLORS = {
  primary: '#17d961',
  primaryHover: '#00BFA5',
  backgroundLight: '#f6f8f7',
  backgroundDark: '#112117',
  surfaceLight: '#ffffff',
  surfaceDark: '#1F2937',
  textMainLight: '#1F2937',
  textMainDark: '#F9FAFB',
  textSubLight: '#6B7280',
  textSubDark: '#9CA3AF',
};

export default function ProfileEditScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const router = useRouter();

  const [footballSkill, setFootballSkill] = useState(85);
  const [basketballSkill, setBasketballSkill] = useState(50);
  const [profileVisible, setProfileVisible] = useState(true);
  const [historyVisible, setHistoryVisible] = useState(true);

  // Form States
  const [fullName, setFullName] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [cover, setCover] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const response = await fetch(`${API_URL}/backend/profile_api.php?user_id=${userId}`);
      const data = await response.json();
      if (data.id) {
        setFullName(data.name);
        setPosition(data.position);
        setBio(data.stats?.bio || ''); 
        setAvatar(data.avatar);
        setCover(data.cover);
      }
    } catch (e) { console.error(e); }
  };

  const uploadImage = async (uri: string) => {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', {
          uri,
          name: 'upload.jpg',
          type: 'image/jpeg',
      } as any);

      try {
          const response = await fetch(`${API_URL}/backend/upload.php`, {
              method: 'POST',
              body: formData,
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });
          const data = await response.json();
          setUploading(false);
          if (data.status === 'success') {
              return data.url;
          } else {
              Alert.alert('Yükleme Hatası', data.message);
              return null;
          }
      } catch (e) {
          console.error(e);
          setUploading(false);
          Alert.alert('Hata', 'Sunucuya bağlanılamadı');
          return null;
      }
  };

  const pickImage = async (type: 'avatar' | 'cover') => {
      const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: type === 'avatar' ? [1, 1] : [16, 9],
          quality: 0.5,
      });

      if (!result.canceled) {
          const uploadedUrl = await uploadImage(result.assets[0].uri);
          if (uploadedUrl) {
              if (type === 'avatar') setAvatar(uploadedUrl);
              else setCover(uploadedUrl);
          }
      }
  };

  const handleSave = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const response = await fetch(`${API_URL}/backend/profile_api.php?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, position, bio, avatar_url: avatar, cover_url: cover })
      });
      const data = await response.json();
      if (data.status === 'success') {
        Alert.alert('Başarılı', 'Profil güncellendi', [{ text: 'Tamam', onPress: () => router.back() }]);
      } else {
        Alert.alert('Hata', data.message || 'Güncelleme başarısız');
      }
    } catch (e) { Alert.alert('Hata', 'Bağlantı hatası'); }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={24} color={isDark ? COLORS.textMainDark : COLORS.textMainLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
            {uploading ? <ActivityIndicator size="small" color={COLORS.primary} /> : <MaterialIcons name="check" size={24} color={COLORS.primary} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Media Section */}
          <View style={styles.mediaSection}>
              <View style={styles.coverImageContainer}>
                  <Image 
                    source={{ uri: (cover && cover.length > 0) ? cover : 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
                    style={styles.coverImage} 
                  />
                  <View style={styles.coverOverlay}>
                      <TouchableOpacity style={styles.editCoverBtn} onPress={() => pickImage('cover')}>
                          <MaterialIcons name="edit" size={16} color="white" />
                      </TouchableOpacity>
                  </View>
              </View>
              
              <View style={styles.profileImageWrapper}>
                  <View style={styles.profileImageContainer}>
                      <Image 
                        source={{ uri: (avatar && avatar.length > 0) ? avatar : 'https://ui-avatars.com/api/?name=User' }} 
                        style={styles.profileImage} 
                      />
                  </View>
                  <TouchableOpacity style={styles.editProfileBtn} onPress={() => pickImage('avatar')}>
                      <MaterialIcons name="photo-camera" size={18} color="#111827" />
                  </TouchableOpacity>
              </View>
          </View>

          {/* General Info */}
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Genel Bilgiler</Text>
              <View style={styles.card}>
                  <View style={styles.row}>
                      <View style={styles.halfInput}>
                          <Text style={styles.label}>AD SOYAD</Text>
                          <TextInput 
                            style={styles.input} 
                            value={fullName} 
                            onChangeText={setFullName}
                            placeholder="Ad Soyad"
                          />
                      </View>
                      <View style={styles.halfInput}>
                          <Text style={styles.label}>POZİSYON</Text>
                          <TextInput 
                            style={styles.input} 
                            value={position} 
                            onChangeText={setPosition}
                            placeholder="Mevki"
                          />
                      </View>
                  </View>

                  <View style={styles.inputGroup}>
                      <Text style={styles.label}>BİYOGRAFİ</Text>
                      <TextInput 
                        style={[styles.input, styles.textArea]} 
                        value={bio}
                        onChangeText={setBio}
                        multiline
                        textAlignVertical="top"
                        placeholder="Kendinden bahset..."
                      />
                  </View>
              </View>
          </View>

          {/* Sports & Skills */}
          <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Sporlar & Beceriler</Text>
                  <TouchableOpacity style={styles.addSkillBtn}>
                      <MaterialIcons name="add-circle" size={18} color={COLORS.primary} />
                      <Text style={styles.addSkillText}>Ekle</Text>
                  </TouchableOpacity>
              </View>
              
              <View style={styles.card}>
                  {/* Football */}
                  <View style={styles.skillItem}>
                      <View style={styles.skillHeader}>
                          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                              <View style={[styles.sportIcon, { backgroundColor: isDark ? 'rgba(21, 128, 61, 0.3)' : '#dcfce7' }]}>
                                  <MaterialIcons name="sports-soccer" size={20} color={isDark ? '#4ade80' : '#16a34a'} />
                              </View>
                              <Text style={styles.sportName}>Futbol</Text>
                          </View>
                          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                              <View style={styles.levelBadge}>
                                  <Text style={styles.levelText}>YARI-PRO</Text>
                              </View>
                              <TouchableOpacity>
                                  <MaterialIcons name="delete" size={20} color={COLORS.textSubLight} />
                              </TouchableOpacity>
                          </View>
                      </View>
                      <View style={styles.sliderContainer}>
                          <View style={styles.sliderLabels}>
                              <Text style={styles.sliderLabelText}>Acemi</Text>
                              <Text style={styles.sliderLabelText}>Profesyonel</Text>
                          </View>
                          <Slider
                            style={{width: '100%', height: 40}}
                            minimumValue={0}
                            maximumValue={100}
                            value={footballSkill}
                            onValueChange={setFootballSkill}
                            minimumTrackTintColor={COLORS.primary}
                            maximumTrackTintColor={isDark ? '#4b5563' : '#e5e7eb'}
                            thumbTintColor={COLORS.primary}
                          />
                      </View>
                  </View>

                  <View style={styles.divider} />

                  {/* Basketball */}
                  <View style={styles.skillItem}>
                      <View style={styles.skillHeader}>
                          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                              <View style={[styles.sportIcon, { backgroundColor: isDark ? 'rgba(194, 65, 12, 0.3)' : '#ffedd5' }]}>
                                  <MaterialIcons name="sports-basketball" size={20} color={isDark ? '#fb923c' : '#ea580c'} />
                              </View>
                              <Text style={styles.sportName}>Basketbol</Text>
                          </View>
                          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                              <View style={[styles.levelBadge, { backgroundColor: 'rgba(249, 115, 22, 0.1)' }]}>
                                  <Text style={[styles.levelText, { color: '#f97316' }]}>ORTA</Text>
                              </View>
                              <TouchableOpacity>
                                  <MaterialIcons name="delete" size={20} color={COLORS.textSubLight} />
                              </TouchableOpacity>
                          </View>
                      </View>
                      <View style={styles.sliderContainer}>
                          <View style={styles.sliderLabels}>
                              <Text style={styles.sliderLabelText}>Acemi</Text>
                              <Text style={styles.sliderLabelText}>Profesyonel</Text>
                          </View>
                          <Slider
                            style={{width: '100%', height: 40}}
                            minimumValue={0}
                            maximumValue={100}
                            value={basketballSkill}
                            onValueChange={setBasketballSkill}
                            minimumTrackTintColor="#f97316"
                            maximumTrackTintColor={isDark ? '#4b5563' : '#e5e7eb'}
                            thumbTintColor="#f97316"
                          />
                      </View>
                  </View>
              </View>
          </View>

          {/* Social Media */}
          <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sosyal Medya</Text>
              <View style={styles.card}>
                  <View style={styles.iconInput}>
                      <FontAwesome5 name="instagram" size={20} color="#ec4899" style={styles.inputIcon} />
                      <TextInput style={[styles.input, { paddingLeft: 40 }]} defaultValue="@alex_j_soccer" placeholder="Instagram Kullanıcı Adı" />
                  </View>
                  <View style={[styles.iconInput, { marginTop: 12 }]}>
                      <FontAwesome5 name="twitter" size={20} color="#60a5fa" style={styles.inputIcon} />
                      <TextInput style={[styles.input, { paddingLeft: 40 }]} placeholder="Twitter / X" />
                  </View>
                  <View style={[styles.iconInput, { marginTop: 12 }]}>
                      <FontAwesome5 name="tiktok" size={20} color={isDark ? 'white' : 'black'} style={styles.inputIcon} />
                      <TextInput style={[styles.input, { paddingLeft: 40 }]} placeholder="TikTok" />
                  </View>
              </View>
          </View>

          {/* Privacy & Account */}
          <View style={[styles.section, { marginBottom: 20 }]}>
              <Text style={styles.sectionTitle}>Gizlilik & Hesap</Text>
              <View style={styles.card}>
                  <View style={styles.settingRow}>
                      <View>
                          <Text style={styles.settingLabel}>Profil Görünürlüğü</Text>
                          <Text style={styles.settingDesc}>Profilini herkes görebilir</Text>
                      </View>
                      <Switch 
                        value={profileVisible} 
                        onValueChange={setProfileVisible}
                        trackColor={{ false: '#767577', true: COLORS.primary }}
                        thumbColor={'white'}
                      />
                  </View>
                  
                  <View style={styles.divider} />

                  <View style={styles.settingRow}>
                      <View>
                          <Text style={styles.settingLabel}>Etkinlik Geçmişi</Text>
                          <Text style={styles.settingDesc}>Son maçlarını göster</Text>
                      </View>
                      <Switch 
                        value={historyVisible} 
                        onValueChange={setHistoryVisible}
                        trackColor={{ false: '#767577', true: COLORS.primary }}
                        thumbColor={'white'}
                      />
                  </View>

                  <View style={styles.divider} />

                  <TouchableOpacity style={styles.actionRow}>
                      <Text style={styles.actionText}>Şifre Değiştir</Text>
                      <MaterialIcons name="chevron-right" size={24} color={COLORS.textSubLight} />
                  </TouchableOpacity>

                  <View style={styles.divider} />

                  <TouchableOpacity style={styles.actionRow}>
                      <Text style={[styles.actionText, { color: '#ef4444' }]}>Hesabı Sil</Text>
                      <MaterialIcons name="delete" size={20} color="#fca5a5" />
                  </TouchableOpacity>
              </View>
          </View>

      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
          <View style={styles.footerContent}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                  <Text style={styles.cancelButtonText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={() => router.back()}>
                  <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
          </View>
      </View>

    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: isDark ? 'rgba(17, 33, 23, 0.9)' : 'rgba(246, 248, 247, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
  },
  scrollContent: {
    paddingBottom: 100,
    padding: 16,
  },
  mediaSection: {
    marginBottom: 48,
    position: 'relative',
  },
  coverImageContainer: {
    height: 160,
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: 8,
  },
  editCoverBtn: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 6,
    borderRadius: 12,
  },
  profileImageWrapper: {
    position: 'absolute',
    bottom: -40,
    left: '50%',
    marginLeft: -56,
    width: 112,
    height: 112,
  },
  profileImageContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    overflow: 'hidden',
    backgroundColor: isDark ? '#374151' : '#e5e7eb',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  editProfileBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.primary,
    padding: 6,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: isDark ? COLORS.textSubDark : COLORS.textSubLight,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
    fontWeight: '500',
  },
  inputGroup: {
    marginTop: 12,
    gap: 4,
  },
  iconInput: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  textArea: {
    minHeight: 80,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addSkillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addSkillText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  skillItem: {
    gap: 12,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
  },
  levelBadge: {
    backgroundColor: 'rgba(23, 217, 97, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  sliderContainer: {
    gap: 8,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    fontSize: 12,
    color: isDark ? COLORS.textSubDark : COLORS.textSubLight,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
    marginVertical: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
  },
  settingDesc: {
    fontSize: 12,
    color: isDark ? COLORS.textSubDark : COLORS.textSubLight,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
    padding: 16,
    paddingBottom: 24,
  },
  footerContent: {
    flexDirection: 'row',
    gap: 16,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: isDark ? COLORS.backgroundDark : '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
});
