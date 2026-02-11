import React, { useState } from 'react';
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
  Platform,
  Switch,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#13ec5b',
  backgroundLight: '#f6f8f6',
  backgroundDark: '#102216',
  surfaceLight: '#ffffff',
  surfaceDark: '#1c2e24',
  textLight: '#111813',
  textDark: '#ffffff',
  gray: '#9ca3af',
  grayLight: '#e5e7eb',
  grayDark: '#374151',
};

export default function CreateTeamScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const router = useRouter();
  
  const [privacy, setPrivacy] = useState('public');
  const [approval, setApproval] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={24} color={isDark ? COLORS.textDark : COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Takım Oluştur</Text>
        <View style={{width: 40}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Media Section */}
          <View style={styles.mediaSection}>
              <View style={styles.coverImageContainer}>
                  <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }} 
                    style={styles.coverImage} 
                  />
                  <View style={styles.coverOverlay}>
                      <TouchableOpacity style={styles.uploadCoverBtn}>
                          <MaterialIcons name="crop" size={20} color="white" />
                          <Text style={styles.uploadCoverText}>Kapak Yükle</Text>
                      </TouchableOpacity>
                  </View>
              </View>
              
              <View style={styles.logoContainer}>
                  <View style={styles.logoWrapper}>
                      <View style={styles.logoPlaceholder}>
                          <MaterialIcons name="photo-camera" size={28} color="white" />
                      </View>
                  </View>
              </View>
          </View>

          {/* Form Content */}
          <View style={styles.formContainer}>
              
              {/* Basic Info */}
              <View style={styles.section}>
                  <Text style={styles.label}>Takım İsmi</Text>
                  <TextInput 
                    style={styles.input}
                    placeholder="Örn: Kadıköy Boğaları"
                    placeholderTextColor={COLORS.gray}
                  />

                  <Text style={styles.label}>Spor Türü</Text>
                  <View style={styles.inputIconWrapper}>
                      <TextInput 
                        style={[styles.input, { paddingRight: 40 }]}
                        placeholder="Branş Seçin"
                        placeholderTextColor={COLORS.gray}
                      />
                      <MaterialIcons name="expand-more" size={24} color={COLORS.gray} style={styles.inputIconRight} />
                  </View>

                  <Text style={styles.label}>Lokasyon</Text>
                  <View style={styles.inputIconWrapper}>
                      <MaterialIcons name="location-on" size={20} color={COLORS.gray} style={styles.inputIconLeft} />
                      <TextInput 
                        style={[styles.input, { paddingLeft: 40, paddingRight: 40 }]}
                        placeholder="Şehir veya saha ara..."
                        placeholderTextColor={COLORS.gray}
                      />
                       <MaterialIcons name="my-location" size={20} color={COLORS.gray} style={styles.inputIconRight} />
                  </View>

                  {/* Map Preview */}
                  <View style={styles.mapPreview}>
                      <Image 
                        source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                        style={styles.mapImage}
                      />
                      <View style={styles.mapOverlay}>
                           <View style={styles.mapBtn}>
                               <Text style={styles.mapBtnText}>Haritada Seç</Text>
                           </View>
                      </View>
                  </View>
              </View>

              <View style={styles.divider} />

              {/* Details Section */}
              <View style={styles.section}>
                  <Text style={styles.sectionHeader}>Takım Detayları</Text>
                  
                  <Text style={styles.label}>Takım Açıklaması</Text>
                  <TextInput 
                    style={[styles.input, styles.textArea]}
                    placeholder="Takımınız hakkında kısa bir bilgi verin..."
                    placeholderTextColor={COLORS.gray}
                    multiline
                    textAlignVertical="top"
                  />

                  <Text style={styles.label}>Takım Kuralları</Text>
                  <TextInput 
                    style={[styles.input, styles.textArea]}
                    placeholder="Örn: Her maç öncesi 15dk ısınma zorunludur."
                    placeholderTextColor={COLORS.gray}
                    multiline
                    textAlignVertical="top"
                  />

                  <Text style={styles.label}>Takım Renkleri</Text>
                  <View style={styles.colorsRow}>
                      <TouchableOpacity style={[styles.colorBtn, { backgroundColor: '#ef4444' }]} />
                      <TouchableOpacity style={[styles.colorBtn, { backgroundColor: '#3b82f6' }]} />
                      <TouchableOpacity style={[styles.colorBtn, { backgroundColor: '#facc15', borderWidth: 2, borderColor: COLORS.primary }]} />
                      <TouchableOpacity style={[styles.colorBtn, styles.addColorBtn]}>
                          <MaterialIcons name="add" size={20} color={COLORS.gray} />
                      </TouchableOpacity>
                  </View>
              </View>

               <View style={styles.divider} />

               {/* Settings Section */}
               <View style={styles.section}>
                   <Text style={styles.sectionHeader}>Ayarlar</Text>
                   
                   <Text style={styles.label}>Gizlilik</Text>
                   <View style={styles.privacySelector}>
                       <TouchableOpacity 
                            style={[styles.privacyOption, privacy === 'public' && styles.privacyOptionActive]}
                            onPress={() => setPrivacy('public')}
                       >
                           <MaterialIcons name="public" size={20} color={privacy === 'public' ? (isDark ? 'white' : '#111813') : COLORS.gray} />
                           <Text style={[styles.privacyText, privacy === 'public' && styles.privacyTextActive]}>Açık</Text>
                       </TouchableOpacity>
                       <TouchableOpacity 
                            style={[styles.privacyOption, privacy === 'private' && styles.privacyOptionActive]}
                            onPress={() => setPrivacy('private')}
                       >
                           <MaterialIcons name="lock" size={20} color={privacy === 'private' ? (isDark ? 'white' : '#111813') : COLORS.gray} />
                           <Text style={[styles.privacyText, privacy === 'private' && styles.privacyTextActive]}>Özel</Text>
                       </TouchableOpacity>
                       <TouchableOpacity 
                            style={[styles.privacyOption, privacy === 'hidden' && styles.privacyOptionActive]}
                            onPress={() => setPrivacy('hidden')}
                       >
                           <MaterialIcons name="visibility-off" size={20} color={privacy === 'hidden' ? (isDark ? 'white' : '#111813') : COLORS.gray} />
                           <Text style={[styles.privacyText, privacy === 'hidden' && styles.privacyTextActive]}>Gizli</Text>
                       </TouchableOpacity>
                   </View>
                   <Text style={styles.helperText}>Herkese açık takımlar arama sonuçlarında listelenir.</Text>

                   <View style={styles.settingRow}>
                       <View>
                           <Text style={styles.settingTitle}>Üye Kabulü</Text>
                           <Text style={styles.settingSubtitle}>Katılım isteklerini onayla</Text>
                       </View>
                       <Switch 
                        value={approval} 
                        onValueChange={setApproval}
                        trackColor={{ false: '#767577', true: COLORS.primary }}
                        thumbColor={'white'}
                       />
                   </View>

               </View>

          </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
          <TouchableOpacity style={styles.createButton}>
              <MaterialIcons name="group-add" size={24} color="#102216" />
              <Text style={styles.createButtonText}>Takım Oluştur</Text>
          </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: isDark ? 'rgba(16, 34, 22, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  mediaSection: {
    position: 'relative',
    marginBottom: 60,
  },
  coverImageContainer: {
    height: 192,
    width: '100%',
    position: 'relative',
    backgroundColor: isDark ? COLORS.surfaceDark : '#e5e7eb',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadCoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  uploadCoverText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  logoContainer: {
    position: 'absolute',
    bottom: -48,
    left: 24,
  },
  logoWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
    backgroundColor: isDark ? '#374151' : '#d1d5db',
    overflow: 'hidden',
  },
  logoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  formContainer: {
    paddingHorizontal: 16,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#d1d5db' : '#374151',
    marginLeft: 4,
  },
  input: {
    backgroundColor: isDark ? COLORS.surfaceDark : 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: isDark ? COLORS.textDark : COLORS.textLight,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
  },
  inputIconWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIconLeft: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  inputIconRight: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  mapPreview: {
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapBtn: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mapBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'black',
  },
  divider: {
    height: 1,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  textArea: {
    minHeight: 100,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  colorBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  addColorBtn: {
    backgroundColor: isDark ? '#374151' : 'white',
    borderWidth: 1,
    borderColor: isDark ? '#4b5563' : '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacySelector: {
    flexDirection: 'row',
    backgroundColor: isDark ? COLORS.surfaceDark : '#f3f4f6',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  privacyOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  privacyOptionActive: {
    backgroundColor: isDark ? '#4b5563' : 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray,
  },
  privacyTextActive: {
    color: isDark ? 'white' : '#111813',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
    marginTop: -8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: isDark ? COLORS.surfaceDark : 'white',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: isDark ? 'rgba(16, 34, 22, 0.8)' : 'rgba(246, 248, 246, 0.8)',
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#102216',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
