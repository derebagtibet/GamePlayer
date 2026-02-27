import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '@/constants/Config';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export default function CreateEventScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const router = useRouter();

  const [matchType, setMatchType] = useState('friendly'); // friendly, competitive
  const [paymentRequired, setPaymentRequired] = useState(false);
  
  // Form States
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Futbol');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Date & Time Picker States
  const [dateObj, setDateObj] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  const onPickerChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || dateObj;
    setShowPicker(Platform.OS === 'ios');
    setDateObj(currentDate);
  };

  const showMode = (currentMode: 'date' | 'time') => {
    setShowPicker(true);
    setPickerMode(currentMode);
  };

  const formatDateForDisplay = (date: Date) => {
    const d = date.getDate();
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    return `${d < 10 ? '0' + d : d}.${m < 10 ? '0' + m : m}.${y}`;
  };

  const formatTimeForDisplay = (date: Date) => {
    const h = date.getHours();
    const m = date.getMinutes();
    return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
  };

  const handleCreateEvent = async () => {
    if (!title || !location) {
        Alert.alert('Eksik Bilgi', 'Lütfen başlık ve konum alanlarını doldurun.');
        return;
    }

    setLoading(true);

    try {
        const userId = await AsyncStorage.getItem('user_id');
        // Backend formatı: YYYY-MM-DD HH:MM:SS
        const pad = (n: number) => (n < 10 ? '0' + n : n);
        const formattedDate = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:00`;

        const response = await fetch(`${API_URL}/backend/events_api.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId, // Organizatör ID
                title,
                category,
                date: formattedDate,
                location,
                description,
                price: paymentRequired ? price : 0,
                type: matchType
            }),
        });

        const result = await response.json();

        if (result.status === 'success') {
            Alert.alert('Başarılı', 'Etkinlik başarıyla oluşturuldu!', [
                { text: 'Tamam', onPress: () => router.back() }
            ]);
        } else {
            Alert.alert('Hata', result.message || 'Bir sorun oluştu.');
        }
    } catch (error) {
        Alert.alert('Hata', 'Bağlantı hatası oluştu.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={24} color={isDark ? COLORS.textDark : COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Etkinlik Oluştur</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Cover Section */}
          <View style={styles.mediaSection}>
              <View style={styles.coverImageContainer}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1552667466-07770ae110d0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                    style={styles.coverImage}
                  />
                  <View style={styles.coverOverlay}>
                      <TouchableOpacity style={styles.uploadCoverBtn}>
                          <MaterialIcons name="add-a-photo" size={20} color="white" />
                          <Text style={styles.uploadCoverText}>Görsel Ekle</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>

          {/* Form Content */}
          <View style={styles.formContainer}>

              {/* Basic Info */}
              <View style={styles.section}>
                  <Text style={styles.label}>Etkinlik Başlığı</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: Haftasonu Halı Saha Maçı"
                    placeholderTextColor={COLORS.gray}
                    value={title}
                    onChangeText={setTitle}
                  />

                  <View style={styles.row}>
                    <View style={{flex: 1}}>
                        <Text style={styles.label}>Spor Türü</Text>
                        <View style={styles.inputIconWrapper}>
                            <TextInput
                                style={[styles.input, { paddingRight: 32 }]}
                                placeholder="Futbol"
                                placeholderTextColor={COLORS.gray}
                                value={category}
                                onChangeText={setCategory}
                            />
                            <MaterialIcons name="expand-more" size={24} color={COLORS.gray} style={styles.inputIconRight} />
                        </View>
                    </View>
                     <View style={{flex: 1}}>
                        <Text style={styles.label}>Oyuncu Sayısı</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="14"
                            keyboardType="numeric"
                            placeholderTextColor={COLORS.gray}
                        />
                    </View>
                  </View>

                  <Text style={styles.label}>Tarih ve Saat</Text>
                  <View style={styles.row}>
                      <TouchableOpacity style={[styles.inputIconWrapper, {flex: 3}]} onPress={() => showMode('date')}>
                          <MaterialIcons name="calendar-today" size={20} color={COLORS.gray} style={styles.inputIconLeft} />
                          <View style={[styles.input, { paddingLeft: 40, justifyContent: 'center' }]}>
                             <Text style={{ color: isDark ? COLORS.textDark : COLORS.textLight }}>
                                {formatDateForDisplay(dateObj)}
                             </Text>
                          </View>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.inputIconWrapper, {flex: 2}]} onPress={() => showMode('time')}>
                          <MaterialIcons name="schedule" size={20} color={COLORS.gray} style={styles.inputIconLeft} />
                          <View style={[styles.input, { paddingLeft: 40, justifyContent: 'center' }]}>
                             <Text style={{ color: isDark ? COLORS.textDark : COLORS.textLight }}>
                                {formatTimeForDisplay(dateObj)}
                             </Text>
                          </View>
                      </TouchableOpacity>
                  </View>

                  {showPicker && (
                    <DateTimePicker
                      value={dateObj}
                      mode={pickerMode}
                      is24Hour={true}
                      display="default"
                      onChange={onPickerChange}
                    />
                  )}

                  <Text style={styles.label}>Konum / Tesis</Text>
                  <View style={styles.inputIconWrapper}>
                      <MaterialIcons name="location-on" size={20} color={COLORS.gray} style={styles.inputIconLeft} />
                      <TextInput
                        style={[styles.input, { paddingLeft: 40, paddingRight: 40 }]}
                        placeholder="Tesis veya konum ara..."
                        placeholderTextColor={COLORS.gray}
                        value={location}
                        onChangeText={setLocation}
                      />
                       <MaterialIcons name="my-location" size={20} color={COLORS.gray} style={styles.inputIconRight} />
                  </View>
              </View>

              <View style={styles.divider} />

              {/* Details Section */}
              <View style={styles.section}>
                  <Text style={styles.sectionHeader}>Etkinlik Detayları</Text>

                  <Text style={styles.label}>Açıklama</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Etkinlik hakkında detaylar, kurallar..."
                    placeholderTextColor={COLORS.gray}
                    multiline
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                  />

                  <Text style={styles.label}>Maç Türü</Text>
                  <View style={styles.typeSelector}>
                       <TouchableOpacity
                            style={[styles.typeOption, matchType === 'friendly' && styles.typeOptionActive]}
                            onPress={() => setMatchType('friendly')}
                       >
                           <MaterialIcons name="emoji-people" size={20} color={matchType === 'friendly' ? (isDark ? 'white' : '#111813') : COLORS.gray} />
                           <Text style={[styles.typeText, matchType === 'friendly' && styles.typeTextActive]}>Dostluk</Text>
                       </TouchableOpacity>
                       <TouchableOpacity
                            style={[styles.typeOption, matchType === 'competitive' && styles.typeOptionActive]}
                            onPress={() => setMatchType('competitive')}
                       >
                           <MaterialIcons name="emoji-events" size={20} color={matchType === 'competitive' ? (isDark ? 'white' : '#111813') : COLORS.gray} />
                           <Text style={[styles.typeText, matchType === 'competitive' && styles.typeTextActive]}>Rekabetçi</Text>
                       </TouchableOpacity>
                   </View>
              </View>

               <View style={styles.divider} />

               {/* Settings Section */}
               <View style={styles.section}>
                   <View style={styles.settingRow}>
                       <View>
                           <Text style={styles.settingTitle}>Ücretli Etkinlik</Text>
                           <Text style={styles.settingSubtitle}>Katılım için ödeme gerekir</Text>
                       </View>
                       <Switch
                        value={paymentRequired}
                        onValueChange={setPaymentRequired}
                        trackColor={{ false: '#767577', true: COLORS.primary }}
                        thumbColor={'white'}
                       />
                   </View>

                   {paymentRequired && (
                       <View style={{marginTop: 12}}>
                           <Text style={styles.label}>Kişi Başı Ücret (TL)</Text>
                           <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                keyboardType="numeric"
                                placeholderTextColor={COLORS.gray}
                                value={price}
                                onChangeText={setPrice}
                            />
                       </View>
                   )}
               </View>

          </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent} disabled={loading}>
              {loading ? (
                   <ActivityIndicator color="#102216" />
              ) : (
                  <>
                    <MaterialIcons name="check-circle" size={24} color="#102216" />
                    <Text style={styles.createButtonText}>Etkinliği Yayınla</Text>
                  </>
              )}
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
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
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
    marginBottom: 24,
  },
  coverImageContainer: {
    height: 160,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  uploadCoverText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  formContainer: {
    paddingHorizontal: 16,
    gap: 24,
  },
  section: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#d1d5db' : '#374151',
    marginLeft: 4,
    marginBottom: -8,
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
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: isDark ? COLORS.surfaceDark : '#f3f4f6',
    borderRadius: 12,
    padding: 4, gap: 4,
  },
  typeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  typeOptionActive: {
    backgroundColor: isDark ? '#4b5563' : 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  typeTextActive: {
    color: isDark ? 'white' : '#111813',
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
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
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
