import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#17da62',
  primaryDark: '#7a9b13',
  backgroundLight: '#f6f8f7',
  backgroundDark: '#112117',
  surfaceLight: '#ffffff',
  surfaceDark: '#2a301c',
  textMainLight: '#161811',
  textMainDark: '#e8ebe2',
  textSubLight: '#7f8863',
  textSubDark: '#aeb59a',
  gray: '#9ca3af',
};

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const router = useRouter();
  const [filter, setFilter] = useState('all');

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
          <TouchableOpacity>
            <Text style={styles.readAllText}>Tümünü Oku</Text>
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
        
        {/* NEW Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>YENİ</Text>
            
            {/* Invite Notification */}
            <TouchableOpacity style={styles.notificationItemUnread}>
                <View style={styles.avatarContainer}>
                    <Image 
                        source={{ uri: 'https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=random' }} 
                        style={styles.avatar} 
                    />
                    <View style={styles.iconBadge}>
                        <MaterialIcons name="sports-soccer" size={12} color="white" />
                    </View>
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.contentHeader}>
                         <Text style={styles.contentText} numberOfLines={2}>
                            <Text style={styles.boldText}>Ahmet Yılmaz</Text> seni Kadıköy maçı için davet etti
                         </Text>
                         <View style={styles.unreadDot} />
                    </View>
                    <Text style={styles.subText}>Kadıköy Halı Saha • 21:00</Text>
                    <Text style={styles.timeTextActive}>2 dakika önce</Text>
                </View>
                <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Kabul Et</Text>
                </TouchableOpacity>
            </TouchableOpacity>

            {/* System Alert */}
             <TouchableOpacity style={[styles.notificationItemUnread, { borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }]}>
                <View style={styles.avatarContainer}>
                    <View style={[styles.systemIconCircle, { backgroundColor: isDark ? 'rgba(234, 179, 8, 0.2)' : '#fef9c3' }]}>
                         <MaterialIcons name="warning" size={24} color={isDark ? '#facc15' : '#ca8a04'} />
                    </View>
                </View>
                <View style={styles.contentContainer}>
                     <View style={styles.contentHeader}>
                         <Text style={styles.contentText}>Eksik Oyuncu Uyarısı</Text>
                         <View style={styles.unreadDot} />
                    </View>
                    <Text style={styles.subText} numberOfLines={2}>Yarınki 19:00 maçı için kaleci pozisyonu hala boş.</Text>
                    <Text style={styles.timeTextActive}>15 dakika önce</Text>
                </View>
            </TouchableOpacity>
        </View>

        {/* TODAY Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>BUGÜN</Text>

             <TouchableOpacity style={styles.notificationItem}>
                 <View style={styles.avatarContainer}>
                    <View style={[styles.systemIconCircle, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' }]}>
                         <MaterialIcons name="calendar-today" size={24} color={isDark ? '#60a5fa' : '#2563eb'} />
                    </View>
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.contentText}>Maç Hatırlatması</Text>
                    <Text style={styles.subText}>Beşiktaş Sahil Spor Tesisi&apos;ndeki maçın başlamasına 2 saat kaldı.</Text>
                    <Text style={styles.timeText}>2 saat önce</Text>
                </View>
             </TouchableOpacity>

             <TouchableOpacity style={[styles.notificationItem, { borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }]}>
                <View style={styles.avatarContainer}>
                    <Image 
                        source={{ uri: 'https://ui-avatars.com/api/?name=Mehmet+Demir&background=random' }} 
                        style={styles.avatar} 
                    />
                     <View style={[styles.iconBadge, { backgroundColor: '#22c55e' }]}>
                        <MaterialIcons name="check" size={12} color="white" />
                    </View>
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.contentText}><Text style={styles.boldText}>Mehmet Demir</Text> davetini kabul etti.</Text>
                    <Text style={styles.subText}>Kadrosu tamamlandı.</Text>
                    <Text style={styles.timeText}>3 saat önce</Text>
                </View>
             </TouchableOpacity>
        </View>
        
        {/* YESTERDAY Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>DÜN</Text>
             <TouchableOpacity style={[styles.notificationItem, { opacity: 0.7 }]}>
                 <View style={styles.avatarContainer}>
                    <View style={[styles.systemIconCircle, { backgroundColor: isDark ? 'rgba(168, 85, 247, 0.2)' : '#f3e8ff' }]}>
                         <MaterialIcons name="percent" size={24} color={isDark ? '#c084fc' : '#9333ea'} />
                    </View>
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.contentText}>Haftalık abonelikte %20 indirim!</Text>
                    <Text style={styles.subText}>Premium özelliklere erişmek için harika bir fırsat.</Text>
                    <Text style={styles.timeText}>Dün</Text>
                </View>
             </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

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
