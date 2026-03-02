import React, { useState, useCallback } from 'react';
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
import { useRouter, useFocusEffect } from 'expo-router';
import { apiGet } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#17da62',
  primaryDark: '#0eb545',
  backgroundLight: '#f2f4f1',
  backgroundDark: '#112117',
  surfaceLight: '#ffffff',
  surfaceDark: '#162a1d',
  textLight: '#0f172a', // Slate 900
  textDark: '#ffffff',
  textSecondaryLight: '#64748b',
  textSecondaryDark: '#9db9a6',
  gray: '#9ca3af',
};

export default function MatchesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [matchesData, setMatchesData] = useState<any>({ upcoming: [], past: [] });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchMatches();
    }, [])
  );

  const fetchMatches = async () => {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) { setLoading(false); return; }
    const { ok, data } = await apiGet(`/backend/events_api.php?endpoint=matches&user_id=${userId}`);
    if (ok && data) {
      setMatchesData({
        upcoming: Array.isArray(data.upcoming) ? data.upcoming : [],
        past: Array.isArray(data.past) ? data.past : [],
      });
    }
    setLoading(false);
  };

  const matches = activeTab === 'upcoming' ? matchesData.upcoming : matchesData.past;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Maçlarım</Text>
        <TouchableOpacity style={styles.notificationBtn} onPress={fetchMatches}>
            <MaterialIcons name="refresh" size={28} color={isDark ? COLORS.textDark : COLORS.textLight} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
          <View style={styles.tabWrapper}>
              <View style={[styles.tabIndicator, activeTab === 'upcoming' ? { left: 4 } : { left: '50%' }]} />
              
              <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('upcoming')}>
                  <Text style={[styles.tabText, activeTab === 'upcoming' ? styles.tabTextActive : styles.tabTextInactive]}>Yaklaşan Maçlar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('past')}>
                  <Text style={[styles.tabText, activeTab === 'past' ? styles.tabTextActive : styles.tabTextInactive]}>Geçmiş Maçlar</Text>
              </TouchableOpacity>
          </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
          {activeTab === 'upcoming' ? (
            <>
              {/* Today Section */}
              <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Bugün</Text>
                  <View style={styles.divider} />
              </View>
              {matches.filter((m: any) => m.date === 'Bugün').map((match: any) => (
                <MatchCard key={match.id} match={match} isDark={isDark} router={router} styles={styles} />
              ))}

              {/* This Week Section */}
              <View style={[styles.sectionHeader, { marginTop: 24 }]}>
                  <Text style={styles.sectionTitle}>Bu Hafta</Text>
                  <View style={styles.divider} />
              </View>
              {matches.filter((m: any) => m.date !== 'Bugün').map((match: any) => (
                <MatchCard key={match.id} match={match} isDark={isDark} router={router} styles={styles} />
              ))}
            </>
          ) : (
            <>
              <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Tamamlananlar</Text>
                  <View style={styles.divider} />
              </View>
              {matches.map((match: any) => (
                <PastMatchCard key={match.id} match={match} isDark={isDark} styles={styles} />
              ))}
            </>
          )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/create-team')} 
      >
          <MaterialIcons name="add" size={32} color="white" />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const MatchCard = ({ match, isDark, router, styles }: any) => (
  <TouchableOpacity 
    style={styles.card}
    onPress={() => router.push({
      pathname: '/event-details',
      params: { id: match.id, title: match.title, location: match.location, time: match.time }
    })}
  >
      <View style={styles.cardHeader}>
          <View style={styles.cardInfo}>
              <View style={[styles.iconBox]}>
                  <MaterialIcons name={match.icon} size={32} color={isDark ? 'white' : (match.iconColor || COLORS.primary)} />
              </View>
              <View>
                  <Text style={styles.cardTitle}>{match.title}</Text>
                  <View style={styles.locationRow}>
                      <MaterialIcons name="location-on" size={16} color={isDark ? COLORS.textSecondaryDark : COLORS.textSecondaryLight} />
                      <Text style={styles.locationText}>{match.location}</Text>
                  </View>
              </View>
          </View>
          <View style={match.role === 'OLUŞTURAN' ? styles.badgeCreator : styles.badgeParticipant}>
              <Text style={match.role === 'OLUŞTURAN' ? styles.badgeCreatorText : styles.badgeParticipantText}>{match.role}</Text>
          </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}>
          <MaterialIcons name="people" size={16} color={COLORS.gray} />
          <Text style={{ fontSize: 12, color: COLORS.gray, fontWeight: 'bold' }}>{match.participants || '0/0'}</Text>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardFooter}>
          <View style={{flexDirection: 'row', gap: 16}}>
            {match.date !== 'Bugün' && (
              <View style={styles.timeRow}>
                <MaterialIcons name="calendar-today" size={20} color={isDark ? COLORS.textSecondaryDark : COLORS.textSecondaryLight} />
                <Text style={styles.dateText}>{match.date}</Text>
              </View>
            )}
            <View style={styles.timeRow}>
                <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
                <Text style={styles.timeText}>{match.time}</Text>
            </View>
          </View>
          {match.avatars ? (
            <View style={styles.avatarGroup}>
                {match.avatars.map((a: string, i: number) => (
                  <Image key={i} source={{ uri: `https://ui-avatars.com/api/?name=${a}&background=random` }} style={[styles.avatarSmall, i > 0 && { marginLeft: -8 }]} />
                ))}
                {match.moreCount && (
                  <View style={[styles.avatarSmall, styles.avatarMore, { marginLeft: -8 }]}>
                      <Text style={styles.avatarMoreText}>{match.moreCount}</Text>
                  </View>
                )}
            </View>
          ) : match.singleAvatar ? (
            <Image source={{ uri: `https://ui-avatars.com/api/?name=${match.singleAvatar}&background=random` }} style={styles.avatarSmallSingle} />
          ) : null}
      </View>
  </TouchableOpacity>
);

const PastMatchCard = ({ match, isDark, styles }: any) => {
  const getResultInfo = (result: string) => {
    switch (result) {
      case 'WON': return { label: 'GALİBİYET', color: COLORS.primary, style: styles.scoreWon };
      case 'LOST': return { label: 'MAĞLUBİYET', color: '#ef4444', style: styles.scoreLost };
      case 'DRAW': return { label: 'BERABERLİK', color: '#f59e0b', style: styles.scoreDraw };
      default: return { label: 'SONUÇLANMADI', color: COLORS.gray, style: styles.scoreDefault };
    }
  };

  const resultInfo = getResultInfo(match.result);

  return (
    <View style={[styles.card, { opacity: 0.9 }]}>
        <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#1c2a20' : '#f8fafc' }]}>
                    <MaterialIcons name={match.icon} size={32} color={isDark ? COLORS.textSecondaryDark : COLORS.gray} />
                </View>
                <View>
                    <Text style={[styles.cardTitle, { color: isDark ? COLORS.textSecondaryDark : '#64748b' }]}>{match.title}</Text>
                    <View style={styles.locationRow}>
                        <MaterialIcons name="calendar-today" size={16} color={isDark ? COLORS.textSecondaryDark : COLORS.textSecondaryLight} />
                        <Text style={styles.locationText}>{match.date}</Text>
                    </View>
                </View>
            </View>
            <View style={[styles.scoreBadge, resultInfo.style]}>
                <Text style={styles.scoreText}>{match.score || '- / -'}</Text>
            </View>
        </View>
        <View style={styles.cardFooterPast}>
            <Text style={styles.pastLocationText}>{match.location}</Text>
            <View style={styles.resultTag}>
              <Text style={[styles.resultTabText, { color: resultInfo.color }]}>
                {resultInfo.label}
              </Text>
            </View>
        </View>
    </View>
  );
};

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
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: isDark ? 'rgba(16, 34, 22, 0.9)' : 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  notificationBtn: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 20,
    backgroundColor: isDark ? 'rgba(16, 34, 22, 0.9)' : 'rgba(255, 255, 255, 0.8)',
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#1c3023' : 'rgba(226, 232, 240, 0.7)',
    borderRadius: 12,
    padding: 4,
    position: 'relative',
    height: 48,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    width: '50%',
    bottom: 4,
    backgroundColor: isDark ? '#283f30' : 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: isDark ? 'white' : COLORS.textLight,
  },
  tabTextInactive: {
    color: isDark ? '#6c8876' : COLORS.textSecondaryLight,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: isDark ? '#587a63' : '#94a3b8',
    letterSpacing: 1,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: isDark ? '#283f30' : '#e2e8f0',
  },
  card: {
    backgroundColor: isDark ? COLORS.surfaceDark : 'white', // Gradient simulated as solid for RN
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: isDark ? '#233629' : 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'transparent' : '#f8fafc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: isDark ? COLORS.textSecondaryDark : COLORS.textSecondaryLight,
  },
  badgeCreator: {
    backgroundColor: 'rgba(23, 218, 98, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(23, 218, 98, 0.2)',
  },
  badgeCreatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: isDark ? COLORS.primary : '#15803d',
  },
  badgeParticipant: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeParticipantText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: isDark ? '#94a3b8' : '#64748b',
  },
  cardDivider: {
    height: 1,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
    marginVertical: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardFooterPast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? '#e2e8f0' : '#334155',
  },
  dateText: {
      fontSize: 14,
      fontWeight: '500',
      color: isDark ? '#cbd5e1' : '#334155',
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  scoreWon: {
    backgroundColor: 'rgba(23, 218, 98, 0.1)',
  },
  scoreLost: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  scoreDraw: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  scoreDefault: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? 'white' : '#1e293b',
  },
  pastLocationText: {
    fontSize: 12,
    color: COLORS.gray,
    flex: 1,
  },
  resultTag: {
    marginLeft: 8,
  },
  resultTabText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  avatarGroup: {
    flexDirection: 'row',
  },
  avatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: isDark ? COLORS.surfaceDark : 'white',
  },
  avatarMore: {
    backgroundColor: isDark ? '#283f30' : '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMoreText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: isDark ? 'white' : '#475569',
  },
  avatarSmallSingle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: isDark ? COLORS.surfaceDark : 'white',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
