import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { apiGet, apiPost } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#17da62',
  primaryDark: '#0eb545',
  backgroundLight: '#f6f8f7',
  backgroundDark: '#112117',
  surfaceLight: '#ffffff',
  surfaceDark: '#1a2e22',
  textMainLight: '#111813',
  textMainDark: '#ffffff',
  textSubLight: '#6b7280',
  textSubDark: '#9ca3af',
  gray: '#9ca3af',
};

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) { setLoading(false); return; }
    const { ok, data } = await apiGet(`/backend/notifications_api.php?filter=${filter}&user_id=${userId}`);
    if (ok) {
      setNotifications(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  const handleAccept = async (id: number) => {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) return;
    const { ok } = await apiPost(`/backend/notifications_api.php?endpoint=accept&user_id=${userId}`, { notification_id: id });
    if (ok) fetchNotifications();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={isDark ? COLORS.textMainDark : COLORS.textMainLight} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bildirimler</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={fetchNotifications}>
             <MaterialIcons name="refresh" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton}>
            <MaterialIcons name="settings" size={24} color={isDark ? COLORS.textMainDark : COLORS.textMainLight} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        <View style={styles.segmentWrapper}>
          <TouchableOpacity 
            style={[styles.segmentButton, filter === 'all' && styles.segmentActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.segmentText, filter === 'all' && styles.segmentTextActive]}>Tümü</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segmentButton, filter === 'invites' && styles.segmentActive]}
            onPress={() => setFilter('invites')}
          >
             <Text style={[styles.segmentText, filter === 'invites' && styles.segmentTextActive]}>Davetler</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segmentButton, filter === 'system' && styles.segmentActive]}
            onPress={() => setFilter('system')}
          >
             <Text style={[styles.segmentText, filter === 'system' && styles.segmentTextActive]}>Sistem</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.contentList}>
        
        {loading ? (
             <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : notifications.length === 0 ? (
             <View style={{ alignItems: 'center', marginTop: 40 }}>
                 <Text style={{ color: COLORS.gray }}>Bildirim yok.</Text>
             </View>
        ) : (
            notifications.map((item) => (
                <NotificationItem key={item.id} item={item} isDark={isDark} styles={styles} onAccept={() => handleAccept(item.id)} />
            ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const NotificationItem = ({ item, isDark, styles, onAccept }: any) => {
    // Tipine göre farklı stiller veya ikonlar
    const isInvite = item.type === 'invite';
    const isSystem = item.type === 'system' || item.type === 'alert';
    
    return (
        <TouchableOpacity style={!item.is_read ? styles.notificationItemUnread : styles.notificationItem}>
            <View style={styles.avatarContainer}>
                {isInvite ? (
                     <>
                        <Image 
                            source={{ uri: 'https://ui-avatars.com/api/?name=User&background=random' }} 
                            style={styles.avatar} 
                        />
                        <View style={styles.iconBadge}>
                            <MaterialIcons name="sports-soccer" size={12} color="white" />
                        </View>
                     </>
                ) : (
                    <View style={[styles.systemIconCircle, { backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : '#fef9c3' }]}>
                         <MaterialIcons name={item.type === 'alert' ? 'notifications' : 'info'} size={24} color={isDark ? '#facc15' : '#ca8a04'} />
                    </View>
                )}
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.contentHeader}>
                        <Text style={styles.contentText} numberOfLines={2}>
                        <Text style={styles.boldText}>{item.title}</Text> {item.message}
                        </Text>
                        {!item.is_read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.timeTextActive}>{item.created_at}</Text>
            </View>
            {isInvite && (
                 <TouchableOpacity style={styles.actionButton} onPress={onAccept}>
                    <Text style={styles.actionButtonText}>Kabul Et</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.surfaceLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  readAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  settingsButton: {
    padding: 4,
  },
  segmentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 12,
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.surfaceLight,
  },
  segmentWrapper: {
    flexDirection: 'row',
    backgroundColor: isDark ? COLORS.surfaceDark : '#f3f4f6',
    borderRadius: 8,
    padding: 4,
    height: 40,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: isDark ? COLORS.backgroundDark : 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? COLORS.textSubDark : COLORS.textSubLight,
  },
  segmentTextActive: {
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
    fontWeight: '600',
  },
  contentList: {
    paddingBottom: 40,
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
    minHeight: '100%',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: isDark ? COLORS.textSubDark : COLORS.textSubLight,
    letterSpacing: 1,
  },
  notificationItemUnread: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: isDark ? 'rgba(23, 218, 98, 0.1)' : 'rgba(23, 218, 98, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    gap: 16,
    alignItems: 'center',
  },
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: isDark ? COLORS.surfaceDark : 'transparent',
    gap: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
  },
  systemIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: isDark ? COLORS.backgroundDark : 'white',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  contentText: {
    fontSize: 14,
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
    lineHeight: 20,
    paddingRight: 8,
  },
  boldText: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
  },
  subText: {
    fontSize: 12,
    color: isDark ? COLORS.textSubDark : COLORS.textSubLight,
    fontWeight: '500',
  },
  timeTextActive: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: isDark ? 'rgba(174, 181, 154, 0.7)' : 'rgba(127, 136, 99, 0.7)',
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
