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
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { API_URL } from '@/constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#13ec5b',
  backgroundLight: '#f6f8f6',
  backgroundDark: '#102216',
  surfaceLight: '#ffffff',
  surfaceDark: '#1a2e22',
  textLight: '#111813',
  textDark: '#ffffff',
  gray: '#9ca3af',
  grayLight: '#e5e7eb',
  grayDark: '#374151',
};

const POSITIONS = ['Kaleci', 'Defans', 'Orta Saha', 'Forvet'];

export default function EventDetailsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const router = useRouter();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  
  // Modals & User
  const [modalVisible, setModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [score, setScore] = useState('');
  const [matchDetails, setMatchDetails] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('Orta Saha');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('user_id').then(setCurrentUserId);
    fetchDetails();
  }, [params.id]);

  const fetchDetails = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const response = await fetch(`${API_URL}/backend/event_details_api.php?event_id=${params.id || 1}`);
      const data = await response.json();
      if (data.status === 'success') {
        setEventData(data.event);
        setParticipants(data.participants || []);
        // Kullanıcı katılmış mı kontrol et
        const joined = (data.participants || []).some((p: any) => p.id.toString() === userId);
        setIsJoined(joined);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = async () => {
      if (!currentUserId) return;
      try {
          const response = await fetch(`${API_URL}/backend/events_api.php?endpoint=save_result&user_id=${currentUserId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ event_id: params.id || 1, score, details: matchDetails })
          });
          const data = await response.json();
          if (data.status === 'success') {
              Alert.alert('Başarılı', 'Maç sonucu kaydedildi.');
              setResultModalVisible(false);
              fetchDetails();
          } else { Alert.alert('Hata', data.message); }
      } catch (e) { Alert.alert('Hata', 'İşlem başarısız'); }
  };

  const handleSendInvite = async () => {
      if (!inviteUsername) return;
      try {
          const userId = await AsyncStorage.getItem('user_id');
          const response = await fetch(`${API_URL}/backend/notifications_api.php?endpoint=send_invite&user_id=${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username: inviteUsername, event_id: params.id, message: `Seni maça davet etti.` })
          });
          const data = await response.json();
          if (data.status === 'success') {
              Alert.alert('Başarılı', 'Davet gönderildi');
              setInviteModalVisible(false);
              setInviteUsername('');
          } else { Alert.alert('Hata', data.message); }
      } catch (e) { Alert.alert('Hata', 'İşlem başarısız'); }
  };

  const handleLeave = async () => {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) return;

    Alert.alert('Ayrıl', 'Maçtan ayrılmak istediğine emin misin?', [
        { text: 'İptal', style: 'cancel' },
        { text: 'Ayrıl', style: 'destructive', onPress: async () => {
            try {
                const eventId = parseInt(Array.isArray(params.id) ? params.id[0] : params.id || '0');
                const response = await fetch(`${API_URL}/backend/events_api.php?endpoint=leave&user_id=${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event_id: eventId }),
                });
                const data = await response.json();
                if (data.status === 'success') {
                    Alert.alert('Başarılı', 'Maçtan ayrıldın.');
                    setIsJoined(false);
                    fetchDetails();
                } else {
                    Alert.alert('Hata', data.message || 'İşlem başarısız.');
                }
            } catch (error) { Alert.alert('Hata', 'Bağlantı hatası.'); }
        }}
    ]);
  };

  const handleChat = async (otherUserId: number) => {
      const userId = await AsyncStorage.getItem('user_id');
      if (!userId || userId == otherUserId.toString()) return;

      try {
          const response = await fetch(`${API_URL}/backend/messages_api.php?endpoint=create_conversation&user_id=${userId}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ participants: [userId, otherUserId] })
          });
          const data = await response.json();
          if (data.status === 'success') {
              router.push(`/chat/${data.conversation_id}`);
          }
      } catch (error) { console.error(error); }
  };

  const confirmJoin = async () => {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) return;

    setModalVisible(false);
    try {
      const response = await fetch(`${API_URL}/backend/events_api.php?endpoint=join&user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            event_id: params.id || 1,
            position: selectedPosition 
        }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        Alert.alert('Başarılı', 'Maça katıldınız!');
        fetchDetails(); 
      }
    } catch (error) {
      Alert.alert('Hata', 'Bağlantı hatası.');
    }
  };

  const handleJoinPress = () => {
      if (isJoined) return;
      setModalVisible(true);
  };

  const title = eventData?.title || params.title || 'Etkinlik Detayı';
  const location = eventData?.location || params.location || '-';
  const time = eventData?.event_date || params.time || '-';
  const missingCount = (eventData?.max_participants || 14) - participants.length;
  const isOrganizer = eventData?.organizer_id && currentUserId && eventData.organizer_id.toString() === currentUserId;

  if (loading) {
    return (
        <View style={[styles.container, { justifyContent: 'center' }]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={24} color={isDark ? COLORS.textDark : COLORS.textLight} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{time}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="more-vert" size={24} color={isDark ? COLORS.textDark : COLORS.textLight} />
        </TouchableOpacity>
      </View>

      <View style={{flex: 1}}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Participant Counts */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Kadro</Text>
                <View style={{flexDirection: 'row', gap: 8}}>
                    {missingCount > 0 && (
                        <View style={[styles.countBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                            <Text style={[styles.countText, { color: '#ef4444' }]}>{missingCount} Kişi Eksik</Text>
                        </View>
                    )}
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>{participants.length} / {eventData?.max_participants || 14}</Text>
                    </View>
                </View>
            </View>

            {/* Participants List */}
            <View style={styles.listContainer}>
                {participants.map((p) => (
                    <View key={p.id} style={[styles.participantCard, p.is_organizer && styles.organizerCard]}>
                        <View style={styles.avatarContainer}>
                            <Image 
                                source={{ uri: (p.avatar_url && p.avatar_url.length > 0) ? p.avatar_url : `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || 'User')}` }} 
                                style={styles.avatar} 
                            />
                            {p.is_organizer && (
                                <View style={styles.starBadge}>
                                    <MaterialIcons name="star" size={14} color="#111813" />
                                </View>
                            )}
                        </View>
                        <View style={styles.participantInfo}>
                            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                                <TouchableOpacity onPress={() => router.push(`/user-profile/${p.id}`)}>
                                    <Text style={styles.participantName}>{p.name || 'İsimsiz'}</Text>
                                </TouchableOpacity>
                                {p.is_organizer && (
                                    <View style={styles.roleBadgeOrganizer}>
                                        <Text style={styles.roleTextOrganizer}>ORGANIZATÖR</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.positionText}>{p.position || 'Oyuncu'}</Text>
                        </View>
                        <View style={styles.participantActions}>
                            <TouchableOpacity style={styles.chatButton} onPress={() => handleChat(p.id)}>
                                <MaterialIcons name="chat-bubble" size={18} color={COLORS.gray} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {participants.length < (eventData?.max_participants || 14) && (
                    <View style={styles.invitePlaceholder}>
                        <View style={styles.inviteIconCircle}>
                            <MaterialIcons name="group-add" size={24} color={COLORS.primary} />
                        </View>
                        <View style={{alignItems: 'center'}}>
                            <Text style={styles.inviteTitle}>Eksik Oyuncu</Text>
                            <Text style={styles.inviteSubtitle}>Hala boş yer var!</Text>
                        </View>
                    </View>
                )}
            </View>
          </ScrollView>
      </View>

      <View style={styles.footer}>
          {isOrganizer ? (
              <TouchableOpacity 
                style={[styles.inviteButton, { backgroundColor: '#ef4444' }]} 
                onPress={() => setResultModalVisible(true)}
              >
                  <MaterialIcons name="flag" size={20} color="white" />
                  <Text style={[styles.inviteButtonText, { color: 'white' }]}>Maçı Bitir</Text>
              </TouchableOpacity>
          ) : isJoined ? (
              <TouchableOpacity 
                style={[styles.inviteButton, { backgroundColor: '#ef4444' }]} 
                onPress={handleLeave}
              >
                  <MaterialIcons name="exit-to-app" size={20} color="white" />
                  <Text style={[styles.inviteButtonText, { color: 'white' }]}>Maçtan Ayrıl</Text>
              </TouchableOpacity>
          ) : (
              <TouchableOpacity 
                style={[styles.inviteButton]} 
                onPress={handleJoinPress}
              >
                  <MaterialIcons name="person-add" size={20} color="#102216" />
                  <Text style={styles.inviteButtonText}>Maça Katıl</Text>
              </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.inviteButton, { marginTop: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.primary }]}
            onPress={() => setInviteModalVisible(true)}
          >
              <MaterialIcons name="share" size={20} color={COLORS.primary} />
              <Text style={[styles.inviteButtonText, { color: COLORS.primary }]}>Arkadaş Davet Et</Text>
          </TouchableOpacity>
      </View>

      {/* Result Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={resultModalVisible}
        onRequestClose={() => setResultModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Maç Sonucu</Text>
                
                <TextInput 
                    style={[styles.modalInput, {marginBottom: 12}]}
                    placeholder="Skor (Örn: 5-3)"
                    value={score}
                    onChangeText={setScore}
                />
                <TextInput 
                    style={[styles.modalInput, {marginBottom: 24, height: 80}]}
                    placeholder="Maç detayları..."
                    multiline
                    textAlignVertical="top"
                    value={matchDetails}
                    onChangeText={setMatchDetails}
                />

                <TouchableOpacity style={styles.confirmButton} onPress={handleSaveResult}>
                    <Text style={styles.confirmButtonText}>Kaydet ve Bitir</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.cancelButton} onPress={() => setResultModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* Invite Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={inviteModalVisible}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Arkadaş Davet Et</Text>
                
                <TextInput 
                    style={[styles.modalInput, {marginBottom: 24}]}
                    placeholder="Kullanıcı adı girin..."
                    value={inviteUsername}
                    onChangeText={setInviteUsername}
                    autoCapitalize="none"
                />

                <TouchableOpacity style={styles.confirmButton} onPress={handleSendInvite}>
                    <Text style={styles.confirmButtonText}>Davet Gönder</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.cancelButton} onPress={() => setInviteModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* Position Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Pozisyon Seç</Text>
                <Text style={styles.modalSubtitle}>Maçta hangi mevkide oynayacaksın?</Text>
                
                <View style={styles.positionList}>
                    {POSITIONS.map((pos) => (
                        <TouchableOpacity 
                            key={pos} 
                            style={[styles.positionOption, selectedPosition === pos && styles.positionOptionActive]}
                            onPress={() => setSelectedPosition(pos)}
                        >
                            <MaterialIcons 
                                name={selectedPosition === pos ? "radio-button-checked" : "radio-button-unchecked"} 
                                size={24} 
                                color={selectedPosition === pos ? COLORS.primary : COLORS.gray} 
                            />
                            <Text style={[styles.positionTextModal, selectedPosition === pos && styles.positionTextActive]}>{pos}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity style={styles.confirmButton} onPress={confirmJoin}>
                    <Text style={styles.confirmButtonText}>Onayla ve Katıl</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

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
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? COLORS.surfaceDark : 'white',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 16,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: isDark ? COLORS.surfaceDark : 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#111813',
    borderColor: '#111813',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#e5e7eb' : COLORS.textLight,
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  countBadge: {
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: isDark ? '#86efac' : '#166534',
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 16,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? COLORS.surfaceDark : 'white',
    padding: 12,
    borderRadius: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  organizerCard: {
    borderColor: 'rgba(19, 236, 91, 0.5)',
  },
  avatarContainer: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5e7eb',
  },
  starBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: isDark ? COLORS.surfaceDark : 'white',
  },
  participantInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  roleBadgeOrganizer: {
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleTextOrganizer: {
    fontSize: 10,
    fontWeight: 'bold',
    color: isDark ? '#d1d5db' : '#4b5563',
  },
  positionText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  participantStats: {
    alignItems: 'flex-end',
  },
  participantActions: {
      alignItems: 'flex-end',
      gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  levelText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  chatButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: isDark ? '#374151' : '#f9fafb',
  },
  invitePlaceholder: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: isDark ? '#374151' : '#e5e7eb',
    borderStyle: 'dashed',
    backgroundColor: isDark ? 'rgba(26, 46, 34, 0.5)' : '#f9fafb',
    gap: 12,
  },
  inviteIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  inviteSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  footer: {
    padding: 16,
    backgroundColor: isDark ? COLORS.backgroundDark : 'white',
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#102216',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: isDark ? '#1a2e22' : 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: isDark ? COLORS.textDark : COLORS.textLight,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  positionList: {
    gap: 12,
    marginBottom: 24,
  },
  positionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  positionOptionActive: {
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    borderColor: COLORS.primary,
  },
  positionTextModal: {
    fontSize: 16,
    fontWeight: '500',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  positionTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonText: {
    color: '#102216',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.gray,
    fontWeight: '600',
    fontSize: 16,
  },
});
