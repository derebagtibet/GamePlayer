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
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_URL } from '@/constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#d0ebbc',
  backgroundLight: '#f7f8f6',
  backgroundDark: '#181f13',
  surfaceDark: '#1a2e22',
  textLight: '#111813',
  textDark: '#ffffff',
  gray: '#9ca3af',
  grayLight: '#e5e7eb',
  grayDark: '#374151',
  msgReceivedLight: '#ffffff',
  msgReceivedDark: '#24342a',
};

export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatName, setChatName] = useState('Sohbet');
  const [chatAvatar, setChatAvatar] = useState('');
  const [groupType, setGroupType] = useState('group');

  useEffect(() => {
    let isMounted = true;

    const initChat = async () => {
        if (!isMounted) return;
        setLoading(true);
        try {
            await fetchChatInfo();
            await fetchMessages();
            await markRead();
        } catch (e) {
            console.error(e);
        } finally {
            if (isMounted) setLoading(false);
        }
    };

    initChat();

    return () => {
        isMounted = false;
    };
  }, [id]);

  const fetchChatInfo = async () => {
      try {
          const userId = await AsyncStorage.getItem('user_id');
          const response = await fetch(`${API_URL}/backend/messages_api.php?endpoint=group_info&conversation_id=${id}&user_id=${userId}`);
          const data = await response.json();
          
          if (data.group) {
              setGroupType(data.group.type);
              if (data.group.type === 'direct') {
                  // Diğer kullanıcıyı bul
                  const otherUser = data.participants.find((p: any) => p.id.toString() !== userId);
                  if (otherUser) {
                      setChatName(otherUser.full_name);
                      setChatAvatar(otherUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.full_name)}&background=random`);
                  }
              } else {
                  setChatName(data.group.name);
                  setChatAvatar(data.group.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.group.name)}&background=random`);
              }
          }
      } catch (e) { console.error('Grup bilgisi alınamadı:', e); }
  };

  const markRead = async () => {
      try {
          const userId = await AsyncStorage.getItem('user_id');
          if (userId) {
              await fetch(`${API_URL}/backend/messages_api.php?endpoint=mark_read`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ conversation_id: id, user_id: userId })
              });
          }
      } catch (e) { console.error('Okundu işaretleme hatası:', e); }
  };

  const fetchMessages = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const response = await fetch(`${API_URL}/backend/messages_api.php?endpoint=detail&conversation_id=${id}&user_id=${userId}`);
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    
    try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) return;

        // Geçici olarak mesajı ekrana ekle (optimistic update)
        const newMessage = {
            id: Date.now(),
            content: message,
            created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            sender_id: parseInt(userId),
            is_me: 1,
            sender_name: 'Ben', // Backend'den çekilebilir
        };
        setMessages([...messages, newMessage]);
        setMessage('');

        const response = await fetch(`${API_URL}/backend/messages_api.php?endpoint=send_message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                conversation_id: id,
                sender_id: userId,
                content: newMessage.content
            }),
        });
        
        const data = await response.json();
        if (data.status !== 'success') {
            console.error('Mesaj gönderilemedi:', data.message);
            // Hata durumunda rollback yapılabilir veya kullanıcı uyarılabilir
        } else {
             // Mesaj başarıyla gönderildi, id güncellenebilir
        }
    } catch (error) {
        console.error('Mesaj gönderme hatası:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back-ios" size={20} color={isDark ? '#d1d5db' : '#374151'} />
          </TouchableOpacity>
          <View style={styles.headerUserInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: chatAvatar || `https://ui-avatars.com/api/?name=${chatName}&background=random` }}
                style={styles.avatar}
              />
            </View>
            <View>
              <Text style={styles.headerTitle}>{chatName}</Text>
              <Text style={styles.headerSubtitle}>Aktif</Text>
            </View>
          </View>
        </View>
        {groupType !== 'direct' && (
            <TouchableOpacity style={{ padding: 8 }} onPress={() => router.push(`/chat/group-edit?id=${id}`)}>
                <MaterialIcons name="settings" size={24} color={isDark ? '#d1d5db' : '#374151'} />
            </TouchableOpacity>
        )}
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
            <ScrollView 
                contentContainerStyle={styles.chatScroll}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg) => {
                    const isMe = msg.is_me == 1;
                    return (
                        <View key={msg.id} style={[styles.msgRow, isMe && styles.msgRowSent]}>
                            {!isMe && (
                                <Image 
                                    source={{ uri: msg.sender_avatar || `https://ui-avatars.com/api/?name=${msg.sender_name || 'User'}` }} 
                                    style={styles.msgAvatar}
                                />
                            )}
                            <View style={[styles.msgContent, isMe && { alignItems: 'flex-end' }]}>
                                {!isMe && <Text style={styles.senderName}>{msg.sender_name}</Text>}
                                <View style={isMe ? styles.msgBubbleSent : styles.msgBubbleReceived}>
                                    <Text style={isMe ? styles.msgTextSent : styles.msgTextReceived}>{msg.content}</Text>
                                </View>
                                <Text style={styles.msgTime}>{msg.created_at}</Text>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        )}

        {/* Input Area */}
        <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Mesaj yazın..."
                    placeholderTextColor={COLORS.gray}
                    value={message}
                    onChangeText={setMessage}
                />
            </View>
            <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <MaterialIcons name="send" size={24} color="#112117" />
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
    backgroundColor: isDark ? 'rgba(24, 31, 19, 0.8)' : 'rgba(247, 248, 246, 0.8)', // Blur effect simulation
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22c55e', // Green
    borderWidth: 2,
    borderColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },
  chatScroll: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 16,
  },
  dateDivider: {
    alignItems: 'center',
    marginBottom: 24,
  },
  dateText: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
    color: isDark ? COLORS.gray : '#6b7280',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  msgRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    maxWidth: '85%',
  },
  msgRowSent: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  msgContent: {
    gap: 4,
  },
  senderName: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 12,
  },
  msgBubbleReceived: {
    backgroundColor: isDark ? COLORS.msgReceivedDark : 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  msgBubbleSent: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  msgTextReceived: {
    fontSize: 14,
    color: isDark ? '#e5e7eb' : '#1f2937',
    lineHeight: 20,
  },
  msgTextSent: {
    fontSize: 14,
    color: '#112117',
    fontWeight: '600',
    lineHeight: 20,
  },
  msgTime: {
    fontSize: 10,
    color: COLORS.gray,
    marginLeft: 8,
  },
  sentStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    marginRight: 4,
  },
  typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: COLORS.gray,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? COLORS.surfaceDark : 'white',
    borderRadius: 24,
    minHeight: 48,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
    paddingHorizontal: 4,
  },
  attachButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: isDark ? COLORS.textDark : COLORS.textLight,
    paddingVertical: 12,
    maxHeight: 100,
  },
  emojiButton: {
    padding: 8,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});
