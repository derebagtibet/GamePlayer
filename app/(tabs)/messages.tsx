import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { apiGet } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#17da62',
  backgroundLight: '#f7f8f6',
  backgroundDark: '#181f13',
  surfaceDark: '#1a2e22',
  textLight: '#111813',
  textDark: '#ffffff',
  gray: '#9ca3af',
  grayLight: '#e5e7eb',
  grayDark: '#374151',
};

export default function MessagesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [])
  );

  const fetchConversations = async () => {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) { setLoading(false); return; }
    const { ok, data } = await apiGet(`/backend/messages_api.php?endpoint=list&user_id=${userId}`);
    if (ok) {
      setConversations(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  const handleChatPress = (id: string) => {
    router.push(`/chat/${id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mesajlar</Text>
        <TouchableOpacity style={styles.editButton} onPress={fetchConversations}>
          <MaterialIcons name="refresh" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={24} color={isDark ? '#93c8a7' : COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Sohbet ara..."
            placeholderTextColor={isDark ? '#93c8a7' : COLORS.gray}
          />
        </View>
      </View>

      {/* Online Users (Stories) */}
      <View style={styles.onlineContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.onlineScroll}>
          {/* Add New Group */}
          <TouchableOpacity style={styles.onlineItem} onPress={() => router.push('/chat/create-group')}>
            <View style={styles.addStoryCircle}>
              <MaterialIcons name="add" size={24} color={COLORS.gray} />
            </View>
            <Text style={styles.onlineName}>Yeni Grup</Text>
          </TouchableOpacity>

          {/* Users */}
          <View style={styles.onlineItem}>
            <View style={styles.storyCircleContainer}>
              <Image
                source={{ uri: 'https://ui-avatars.com/api/?name=Ahmet&background=random' }}
                style={styles.storyImage}
              />
              <View style={styles.onlineBadge} />
            </View>
            <Text style={styles.onlineName}>Ahmet</Text>
          </View>
        </ScrollView>
      </View>

      {/* Chat List */}
      <ScrollView contentContainerStyle={styles.chatList}>
        {loading ? (
           <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : conversations.length === 0 ? (
           <Text style={{ textAlign: 'center', marginTop: 20, color: COLORS.gray }}>Mesajınız yok.</Text>
        ) : (
           conversations.map((item) => (
            <TouchableOpacity key={item.id} style={styles.chatItem} onPress={() => handleChatPress(item.id.toString())}>
              <View style={styles.chatAvatarContainer}>
                <Image
                  source={{ uri: item.avatar || 'https://ui-avatars.com/api/?name=Group&background=random' }}
                  style={styles.chatAvatar}
                />
                {item.type === 'group' && (
                  <View style={styles.groupIconBadge}>
                    <MaterialIcons name="group" size={12} color={COLORS.primary} />
                  </View>
                )}
              </View>
              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatTitle}>{item.title}</Text>
                  <Text style={styles.chatTime}>{item.time}</Text>
                </View>
                <View style={styles.chatFooter}>
                  <Text style={styles.chatMessage} numberOfLines={1}>
                    {item.last_message}
                  </Text>
                  {item.unread_count > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{item.unread_count}</Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
           ))
        )}
      </ScrollView>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? COLORS.surfaceDark : 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  onlineContainer: {
    marginTop: 24,
    paddingLeft: 24,
  },
  onlineScroll: {
    paddingRight: 24,
    gap: 16,
  },
  onlineItem: {
    alignItems: 'center',
    gap: 8,
  },
  addStoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
    borderWidth: 2,
    borderColor: isDark ? '#4b5563' : '#d1d5db',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineName: {
    fontSize: 12,
    fontWeight: '500',
    color: isDark ? COLORS.gray : '#6b7280',
  },
  storyCircleContainer: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  storyImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
  },
  chatList: {
    marginTop: 16,
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  chatAvatarContainer: {
    position: 'relative',
  },
  chatAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  groupIconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: isDark ? '#1a2e22' : 'white',
    padding: 2,
    borderRadius: 10,
  },
  chatContent: {
    flex: 1,
    gap: 4,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  chatTime: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  chatTimeLight: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatMessage: {
    fontSize: 14,
    color: isDark ? '#93c8a7' : '#6b7280',
    flex: 1,
    marginRight: 16,
  },
  unreadBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#112117',
  },
});
