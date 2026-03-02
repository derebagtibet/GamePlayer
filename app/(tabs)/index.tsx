import { MaterialIcons } from '@expo/vector-icons';
import React, { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { apiGet } from '@/constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#17da62',
  backgroundLight: '#f6f8f7',
  backgroundDark: '#112117',
  surfaceLight: '#ffffff',
  surfaceDark: '#1A2C20',
  textLight: '#111418',
  textDark: '#ffffff',
  gray: '#9ca3af',
  grayLight: '#f3f4f6',
  grayDark: '#374151',
};

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const router = useRouter();

  const [weather, setWeather] = useState({ temp: '--', condition: 'Yükleniyor...', city: 'KONUM...', icon: 'wb-cloudy' as any });
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [userName, setUserName] = useState('Oyuncu');
  const [loading, setLoading] = useState(true);

  // İlk yüklemede hava durumu çek (her focus'ta tekrar çekmeye gerek yok)
  useEffect(() => {
    fetchWeather();
  }, []);

  // Ekran her odaklandığında dashboard verisini yenile
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const loadAll = async () => {
        const name = await AsyncStorage.getItem('user_name');
        if (name && !cancelled) setUserName(name);

        const userId = await AsyncStorage.getItem('user_id');
        if (!userId || cancelled) { setLoading(false); return; }

        const { ok, data } = await apiGet(`/backend/events_api.php?endpoint=dashboard&user_id=${userId}`);
        if (!cancelled) {
          if (ok && data) setDashboardData(data);
          setLoading(false);
        }
      };

      loadAll();
      return () => { cancelled = true; };
    }, [])
  );

  const fetchWeather = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setWeather(prev => ({ ...prev, city: 'İZİN YOK', condition: '-' }));
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });
      const { latitude, longitude } = location.coords;

      // Reverse geocode
      let address = await Location.reverseGeocodeAsync({ latitude, longitude });
      let city = address[0]?.subregion || address[0]?.city || 'KONUM';

      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const data = await response.json();
      const { temperature, weathercode } = data.current_weather;
      
      let condition = 'Açık';
      let icon = 'wb-sunny';
      
      if (weathercode > 0 && weathercode <= 3) { condition = 'Parçalı Bulutlu'; icon = 'wb-cloudy'; }
      else if (weathercode >= 45 && weathercode <= 48) { condition = 'Sisli'; icon = 'cloud'; }
      else if (weathercode >= 51 && weathercode <= 67) { condition = 'Yağmurlu'; icon = 'grain'; }
      else if (weathercode >= 71 && weathercode <= 77) { condition = 'Karlı'; icon = 'ac-unit'; }
      else if (weathercode >= 80 && weathercode <= 99) { condition = 'Fırtınalı'; icon = 'flash-on'; }

      setWeather({ 
          temp: Math.round(temperature).toString(), 
          condition, 
          city: city.toUpperCase(), 
          icon 
      });
    } catch (e) {
      console.log('Location/Weather error:', e);
      setWeather(prev => ({ ...prev, city: 'İZMİR', condition: 'Güneşli' })); // Fallback
    }
  };

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
      
      {/* Header - Sticky-like behavior would need Animated, simple View for now */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random` }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.welcomeText}>Hoş geldin,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications')}>
          <MaterialIcons name="notifications" size={24} color={isDark ? COLORS.gray : '#4b5563'} />
          {dashboardData?.notifications > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={24} color={COLORS.gray} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Maç, oyuncu veya saha ara..."
              placeholderTextColor={COLORS.gray}
            />
          </View>
        </View>

        {/* Widgets Row */}
        <View style={styles.widgetsRow}>
          {/* Weather Widget */}
          <View style={styles.weatherWidget}>
            <View style={styles.widgetHeader}>
              <MaterialIcons name="location-on" size={16} color={COLORS.gray} />
              <Text style={styles.locationText}>{weather.city}</Text>
            </View>
            <View style={styles.weatherContent}>
              <Text style={styles.tempText}>{weather.temp}°</Text>
              <MaterialIcons name={weather.icon} size={32} color="#facc15" />
            </View>
            <Text style={styles.weatherCondition}>{weather.condition}</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtnPrimary} onPress={() => router.push('/create-event')}>
            <MaterialIcons name="add-circle" size={22} color="#053312" />
            <Text style={styles.actionBtnTextPrimary}>Etkinlik Oluştur</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => router.push('/explore')}>
            <MaterialIcons name="group-add" size={22} color={isDark ? 'white' : '#111827'} />
            <Text style={styles.actionBtnTextSecondary}>Takıma Katıl</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Yaklaşan Etkinlikler</Text>
            <TouchableOpacity onPress={() => router.push('/matches')}>
              <Text style={styles.seeAllText}>TÜMÜ</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {dashboardData?.upcoming_events?.map((event: any) => (
              <EventCard
                key={event.id}
                id={event.id}
                isDark={isDark}
                title={event.title}
                time={event.time}
                location={event.location}
                tag="YAKLAŞAN"
                bgImage={event.bgImage || "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"}
              />
            ))}
          </ScrollView>
        </View>

        {/* Teams Grid */}
        <View style={styles.section}>
           <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Oyuncu Arayanlar</Text>
            <TouchableOpacity onPress={() => router.push('/explore')}>
              <Text style={styles.seeAllText}>TÜMÜ</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.gridContainer}>
             {dashboardData?.teams_looking?.map((team: any) => (
               <TeamCard 
                 key={team.id}
                 id={team.id}
                 isDark={isDark}
                 name={team.name} 
                 distance={team.distance} 
                 need={team.need} 
                 needType={team.type}
               />
             ))}
          </View>
        </View>

        {/* Activity Feed */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {marginBottom: 16}]}>Son Aktiviteler</Text>
          {dashboardData?.activities?.map((activity: any) => (
            <TouchableOpacity 
              key={activity.id}
              style={styles.activityItem}
              onPress={() => router.push({
                pathname: '/event-details',
                params: { title: 'Aktivite Detayı', location: 'Konum Bilgisi', time: activity.time }
              })}
            >
              {activity.type === 'invite' ? (
                <Image 
                  source={{ uri: `https://ui-avatars.com/api/?name=${activity.avatar}&background=random` }} 
                  style={styles.activityAvatar} 
                />
              ) : (
                <View style={styles.activityIconBox}>
                    <MaterialIcons name={activity.icon} size={20} color={COLORS.primary} />
                </View>
              )}
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.text}</Text>
                <Text style={styles.timeText}>{activity.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const EventCard = ({ isDark, id, title, time, location, tag, tagColor = COLORS.primary, bgImage }: any) => {
    const styles = getStyles(isDark);
    const router = useRouter();
    return (
        <TouchableOpacity 
          style={styles.eventCard} 
          onPress={() => router.push({
            pathname: '/event-details',
            params: { id, title, location, time }
          })}
        >
            <Image source={{ uri: bgImage }} style={styles.eventImage} />
            <View style={styles.eventOverlay} />
            <View style={styles.eventDetails}>
                 <View style={styles.eventHeader}>
                     <View style={[styles.tagBadge, { backgroundColor: tagColor === 'orange' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(23, 218, 98, 0.2)' }]}>
                         <Text style={[styles.tagText, { color: tagColor === 'orange' ? '#fb923c' : COLORS.primary }]}>{tag}</Text>
                     </View>
                 </View>
                 <View>
                     <Text style={styles.eventTitle}>{title}</Text>
                     <View style={styles.eventInfoRow}>
                         <MaterialIcons name="schedule" size={14} color={COLORS.primary} />
                         <Text style={styles.eventInfoText}>{time}</Text>
                     </View>
                     <View style={styles.eventInfoRow}>
                         <MaterialIcons name="location-on" size={14} color={COLORS.primary} />
                         <Text style={styles.eventInfoText}>{location}</Text>
                     </View>
                 </View>
            </View>
        </TouchableOpacity>
    )
}

const TeamCard = ({ isDark, id, name, distance, need, needType }: any) => {
    const styles = getStyles(isDark);
    const router = useRouter();
    return (
        <TouchableOpacity 
          style={styles.teamCard} 
          onPress={() => router.push({
            pathname: '/event-details',
            params: { id, title: name, location: distance, time: need }
          })}
        >
            <View style={styles.teamLogoBox}>
                <MaterialIcons name="sports-soccer" size={32} color={isDark ? 'white' : 'black'} />
            </View>
            <Text style={styles.teamName}>{name}</Text>
            <View style={styles.distanceRow}>
                <MaterialIcons name="near-me" size={12} color={COLORS.gray} />
                <Text style={styles.distanceText}>{distance}</Text>
            </View>
            <View style={[
                styles.needBadge, 
                needType === 'urgent' ? { backgroundColor: COLORS.primary } : { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.primary }
            ]}>
                <Text style={[
                    styles.needText,
                    needType === 'urgent' ? { color: '#053312' } : { color: COLORS.primary }
                ]}>{need}</Text>
            </View>
        </TouchableOpacity>
    )
}


const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(23, 218, 98, 0.3)',
  },
  welcomeText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : COLORS.grayLight,
  },
  notificationBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  widgetsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  weatherWidget: {
    flex: 1,
    height: 128,
    borderRadius: 16,
    padding: 16,
    backgroundColor: isDark ? COLORS.surfaceDark : '#1A2C20', // Darker green/black mix
    justifyContent: 'space-between',
  },
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: COLORS.gray,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  weatherContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tempText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  weatherCondition: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  newsWidget: {
    flex: 1,
    height: 128,
    borderRadius: 16,
    padding: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'space-between',
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#053312',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#053312',
    lineHeight: 18,
  },
  newsTime: {
    fontSize: 10,
    color: 'rgba(5, 51, 18, 0.7)',
    marginTop: 4,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 24,
  },
  actionBtnPrimary: {
    flex: 1,
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionBtnTextPrimary: {
    color: '#053312',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionBtnSecondary: {
    flex: 1,
    height: 56,
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : COLORS.grayLight,
  },
  actionBtnTextSecondary: {
    color: isDark ? COLORS.textDark : COLORS.textLight,
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  horizontalScroll: {
    paddingRight: 20,
    gap: 16,
  },
  eventCard: {
    width: 300,
    height: 120,
    borderRadius: 16,
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : COLORS.grayLight,
  },
  eventImage: {
    width: 96,
    height: '100%',
    borderRadius: 12,
  },
  eventOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 16,
    display: 'none', // Removed overlay for cleaner look
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tagBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
    marginBottom: 4,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  eventInfoText: {
    fontSize: 12,
    color: COLORS.gray,
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  teamCard: {
    width: (width - 56) / 2, // 2 columns with padding/gap
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : COLORS.grayLight,
  },
  teamLogoBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: isDark ? '#121f16' : COLORS.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
    marginBottom: 4,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: 12,
  },
  distanceText: {
    fontSize: 11,
    color: COLORS.gray,
  },
  needBadge: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  needText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  activityItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  activityIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(23, 218, 98, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(23, 218, 98, 0.2)',
  },
  activityContent: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : COLORS.grayLight,
    paddingBottom: 12,
  },
  activityText: {
    fontSize: 14,
    color: isDark ? '#d1d5db' : '#374151',
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  highlightText: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
    fontWeight: '500',
  },
});
