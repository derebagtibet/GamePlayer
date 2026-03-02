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
  primary: '#13ec5b',
  primaryDark: '#0eb545',
  backgroundLight: '#f6f8f6',
  backgroundDark: '#102216',
  surfaceLight: '#ffffff',
  surfaceDark: '#1a2e22',
  textMainLight: '#111813',
  textMainDark: '#ffffff',
  textSecondary: '#61896f',
  grayLight: '#f3f4f6',
  grayDark: 'rgba(255,255,255,0.1)',
};

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [joinedEvents, setJoinedEvents] = useState<number[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Kategori değişiminde AbortController ile race condition önleme
  useEffect(() => {
    const abortController = new AbortController();
    fetchEvents(selectedCategory, abortController.signal);
    return () => abortController.abort();
  }, [selectedCategory]);

  const fetchEvents = async (category: string, signal?: AbortSignal) => {
    setLoading(true);
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) { setLoading(false); return; }

    const catParam = category === 'Tümü' ? '' : `&category=${encodeURIComponent(category)}`;
    const { ok, data } = await apiGet(`/backend/events_api.php?endpoint=explore${catParam}&user_id=${userId}`, signal);

    // AbortError durumunda state güncelleme
    if (signal?.aborted) return;

    if (ok && Array.isArray(data)) {
      setEvents(data);
      const joinedIds = data.filter((e: any) => e.is_joined).map((e: any) => e.id);
      setJoinedEvents(joinedIds);
    } else {
      setEvents([]);
      setJoinedEvents([]);
    }
    setLoading(false);
  };

  const handleJoin = async (id: number) => {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) return;

    // Zaten katıldıysa işlem yapma
    if (joinedEvents.includes(id)) return;

    // Optimistic update
    setJoinedEvents(prev => [...prev, id]);

    const { ok } = await apiPost(`/backend/events_api.php?endpoint=join&user_id=${userId}`, { event_id: id });
    if (ok) {
      // Sayıyı güncellemek için tekrar çek
      fetchEvents(selectedCategory);
    } else {
      // Rollback
      setJoinedEvents(prev => prev.filter(eventId => eventId !== id));
    }
  };

  // Backend filtreleme yaptığı için burada filtrelemeye gerek yok
  const filteredEvents = events;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>KEŞFET</Text>
          <Text style={styles.headerTitle}>Etkinlikler</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => fetchEvents(selectedCategory)}>
            <MaterialIcons name="refresh" size={24} color={isDark ? 'white' : '#111813'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="notifications" size={24} color={isDark ? 'white' : '#111813'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapButton}>
            <MaterialIcons name="map" size={24} color="#102216" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Bar */}
      <View>
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterScroll}
            style={styles.filterBar}
        >
            <TouchableOpacity style={styles.filterButtonIcon}>
            <MaterialIcons name="tune" size={20} color={isDark ? 'white' : '#111813'} />
            </TouchableOpacity>
            <View style={styles.filterDivider} />
            
            <FilterChip 
              label="Tümü" 
              isActive={selectedCategory === 'Tümü'} 
              onPress={() => setSelectedCategory('Tümü')}
              isDark={isDark}
            />
            <FilterChip 
              label="Futbol" 
              icon="sports-soccer"
              isActive={selectedCategory === 'Futbol'} 
              onPress={() => setSelectedCategory('Futbol')}
              isDark={isDark}
            />
            <FilterChip 
              label="Basketbol" 
              icon="sports-basketball"
              isActive={selectedCategory === 'Basketbol'} 
              onPress={() => setSelectedCategory('Basketbol')}
              isDark={isDark}
            />
            <FilterChip 
              label="Tenis" 
              icon="sports-tennis"
              isActive={selectedCategory === 'Tenis'} 
              onPress={() => setSelectedCategory('Tenis')}
              isDark={isDark}
            />
        </ScrollView>
      </View>

      {/* Main Content List */}
      <ScrollView contentContainerStyle={styles.contentList}>
        
        {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : (
            filteredEvents.map(event => (
            event.isImageCard ? (
            <TouchableOpacity 
              key={event.id} 
              style={styles.cardImage} 
              onPress={() => router.push({
                pathname: '/event-details',
                params: { id: event.id, title: event.title, location: event.location, time: event.time }
              })}
            >
                <View style={styles.imageContainer}>
                    <Image source={{ uri: event.image }} style={styles.cardBgImage} />
                    <View style={styles.imageOverlay} />
                    <View style={styles.imageContent}>
                        <View style={styles.imageTag}>
                            <Text style={styles.imageTagText}>{event.category}</Text>
                        </View>
                        <Text style={styles.imageTitle}>{event.title}</Text>
                    </View>
                </View>
                <View style={styles.cardImageBody}>
                     <View style={styles.infoRow}>
                        <MaterialIcons name="schedule" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.infoTextSmall}>{event.time}</Text>
                        <View style={styles.dotSeparator} />
                        <Text style={styles.infoTextSmall}>{event.location}</Text>
                    </View>
                    <View style={styles.cardFooter}>
                        <View style={styles.avatarGroup}>
                            <Image source={{ uri: 'https://ui-avatars.com/api/?name=User&background=random' }} style={styles.avatarSmall} />
                            <View style={styles.avatarMore}>
                                <Text style={styles.avatarMoreText}>{event.participants}</Text>
                            </View>
                        </View>
                        <View style={styles.actionButtons}>
                          <TouchableOpacity 
                            style={[styles.joinButtonSmall, joinedEvents.includes(event.id) && styles.joinedButton]} 
                            onPress={() => handleJoin(event.id)}
                          >
                              <Text style={styles.joinButtonText}>
                                {joinedEvents.includes(event.id) ? 'Katıldın' : 'Katıl'}
                              </Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.detailsButtonSmall} 
                            onPress={() => router.push({
                              pathname: '/event-details',
                              params: { id: event.id, title: event.title, location: event.location, time: event.time }
                            })}
                          >
                              <Text style={styles.detailsButtonTextSmall}>Detaylar</Text>
                          </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              key={event.id} 
              style={styles.card} 
              onPress={() => router.push({
                pathname: '/event-details',
                params: { id: event.id, title: event.title, location: event.location, time: event.time }
              })}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                        <View style={[styles.iconBox, { backgroundColor: isDark ? event.iconBgDark : event.iconBg }]}>
                            <MaterialIcons name={event.icon as any} size={24} color={isDark ? event.iconColorDark : event.iconColor} />
                        </View>
                        <View>
                            <Text style={styles.cardTitle}>{event.title}</Text>
                            <Text style={styles.cardSubtitle}>{event.subtitle}</Text>
                        </View>
                    </View>
                    {event.badge && (
                      <View style={[styles.badge, { backgroundColor: isDark ? 'rgba(185, 28, 28, 0.2)' : '#fef2f2', borderColor: isDark ? 'rgba(185, 28, 28, 0.2)' : '#fca5a5' }]}>
                          <Text style={[styles.badgeText, { color: isDark ? '#f87171' : '#b91c1c' }]}>{event.badge}</Text>
                      </View>
                    )}
                </View>

                <View style={styles.cardInfo}>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="calendar-today" size={18} color={COLORS.textSecondary} />
                        <Text style={styles.infoText}>{event.time}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <MaterialIcons name="location-on" size={18} color={COLORS.textSecondary} />
                        <Text style={styles.infoText}>{event.location}</Text>
                    </View>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Kontenjan</Text>
                        <Text style={styles.progressValue}>{event.participants}</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: event.progress, backgroundColor: event.type === 'basketball' ? '#fb923c' : COLORS.primary }]} />
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.priceLabel}>{event.priceLabel || 'Kişi Başı'}</Text>
                        <Text style={styles.priceValue}>{event.price}</Text>
                    </View>
                    <View style={styles.actionButtons}>
                      <TouchableOpacity 
                        style={[styles.joinButton, joinedEvents.includes(event.id) && styles.joinedButton]} 
                        onPress={() => handleJoin(event.id)}
                      >
                          <Text style={styles.joinButtonText}>
                            {joinedEvents.includes(event.id) ? 'Katıldın' : 'Katıl'}
                          </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.detailsButton} 
                        onPress={() => router.push({
                          pathname: '/event-details',
                          params: { id: event.id, title: event.title, location: event.location, time: event.time }
                        })}
                      >
                          <Text style={styles.detailsButtonText}>Detaylar</Text>
                      </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
          )
        )))}

        {filteredEvents.length === 0 && !loading && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <MaterialIcons name="search-off" size={48} color={COLORS.grayLight} />
            <Text style={{ color: COLORS.textSecondary, marginTop: 16, fontSize: 16 }}>Bu kategoride etkinlik bulunamadı.</Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const FilterChip = ({ label, icon, isActive, onPress, isDark }: any) => {
  const chipStyles = getStyles(isDark);
  return (
    <TouchableOpacity
      style={isActive ? chipStyles.filterChipActive : chipStyles.filterChip}
      onPress={onPress}
    >
      {icon && <MaterialIcons name={icon} size={18} color={isActive ? '#102216' : (isDark ? '#e5e7eb' : '#111813')} />}
      <Text style={isActive ? chipStyles.filterChipTextActive : chipStyles.filterChipText}>{label}</Text>
    </TouchableOpacity>
  );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
  },
  mapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  filterBar: {
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  filterButtonIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
  },
  filterDivider: {
    width: 1,
    height: 24,
    backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : '#d1d5db',
    marginHorizontal: 4,
  },
  filterChipActive: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  filterChipTextActive: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#102216',
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#e5e7eb' : COLORS.textMainLight,
  },
  contentList: {
    padding: 16,
    gap: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent',
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
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
    lineHeight: 20,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardInfo: {
    gap: 8,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#e5e7eb' : COLORS.textMainLight,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
  },
  joinButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinedButton: {
    backgroundColor: isDark ? '#122b1a' : '#dcfce7',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  joinButtonText: {
    color: '#102216',
    fontWeight: 'bold',
    fontSize: 13,
  },
  detailsButton: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
    fontWeight: 'bold',
    fontSize: 13,
  },
  cardImage: {
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    height: 128,
    width: '100%',
    position: 'relative',
  },
  cardBgImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  imageContent: {
    position: 'absolute',
    bottom: 12,
    left: 16,
  },
  imageTag: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  imageTagText: {
    color: '#102216',
    fontSize: 10,
    fontWeight: 'bold',
  },
  imageTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardImageBody: {
    padding: 16,
    paddingTop: 12,
  },
  infoTextSmall: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d1d5db',
  },
  avatarGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
  },
  avatarMore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
    borderWidth: 2,
    borderColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  avatarMoreText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  joinButtonSmall: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsButtonSmall: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  detailsButtonTextSmall: {
    color: isDark ? COLORS.textMainDark : COLORS.textMainLight,
    fontWeight: 'bold',
    fontSize: 12,
  },
  skeletonCircle: {
      width: 40, 
      height: 40, 
      borderRadius: 20,
  },
  skeletonLine: {
      borderRadius: 4,
  },
});
