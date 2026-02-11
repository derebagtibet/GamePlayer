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
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

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
                source={{ uri: 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60' }}
                style={styles.avatar}
              />
              <View style={styles.onlineStatus} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Halı Saha Ekibi</Text>
              <Text style={styles.headerSubtitle}>Mehmet yazıyor...</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialIcons name="videocam" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialIcons name="call" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView 
            contentContainerStyle={styles.chatScroll}
            showsVerticalScrollIndicator={false}
        >
            {/* Date Divider */}
            <View style={styles.dateDivider}>
                <Text style={styles.dateText}>Bugün</Text>
            </View>

            {/* Message Received */}
            <View style={styles.msgRow}>
                <Image 
                    source={{ uri: 'https://ui-avatars.com/api/?name=Ahmet&background=random' }} 
                    style={styles.msgAvatar}
                />
                <View style={styles.msgContent}>
                    <Text style={styles.senderName}>Ahmet</Text>
                    <View style={styles.msgBubbleReceived}>
                        <Text style={styles.msgTextReceived}>Gençler bu akşamki maç ne oldu? Kadro tamam mı?</Text>
                    </View>
                    <Text style={styles.msgTime}>18:30</Text>
                </View>
            </View>

            {/* Message Sent */}
            <View style={[styles.msgRow, styles.msgRowSent]}>
                <View style={[styles.msgContent, { alignItems: 'flex-end' }]}>
                    <View style={styles.msgBubbleSent}>
                        <Text style={styles.msgTextSent}>Saha kiralandı, 21:00-22:00 arası. Mert abi de geliyor.</Text>
                    </View>
                    <View style={styles.sentStatusRow}>
                        <Text style={styles.msgTime}>18:35</Text>
                        <MaterialIcons name="done-all" size={14} color={COLORS.primary} />
                    </View>
                </View>
            </View>

            {/* Message Received */}
            <View style={styles.msgRow}>
                <Image 
                    source={{ uri: 'https://ui-avatars.com/api/?name=Mehmet&background=random' }} 
                    style={styles.msgAvatar}
                />
                <View style={styles.msgContent}>
                    <Text style={styles.senderName}>Mehmet</Text>
                    <View style={styles.msgBubbleReceived}>
                        <Text style={styles.msgTextReceived}>Kaleci gelmiyor mu?</Text>
                    </View>
                    <Text style={styles.msgTime}>18:42</Text>
                </View>
            </View>
             
             {/* Typing Indicator Simulation */}
             <View style={styles.msgRow}>
                 <View style={{width: 32}} /> {/* Spacer for avatar */}
                 <View style={[styles.msgBubbleReceived, { width: 60, height: 36, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4 }]}>
                     <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
                     <View style={[styles.typingDot, { animationDelay: '150ms' }]} />
                     <View style={[styles.typingDot, { animationDelay: '300ms' }]} />
                 </View>
             </View>

        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
                <TouchableOpacity style={styles.attachButton}>
                    <MaterialIcons name="add" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
                <TextInput
                    style={styles.textInput}
                    placeholder="Mesaj yazın..."
                    placeholderTextColor={COLORS.gray}
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity style={styles.emojiButton}>
                    <MaterialIcons name="tag-faces" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.sendButton}>
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
