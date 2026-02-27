import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { API_URL } from '@/constants/Config';
import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height } = Dimensions.get('window');

const COLORS = {
  primary: '#17d961',
  backgroundLight: '#f6f8f7',
  backgroundDark: '#112117',
  surfaceLight: '#ffffff',
  surfaceDark: '#1a2c22',
  textLight: '#0e1b13',
  textDark: '#ffffff',
  gray: '#9ca3af',
  grayLight: '#e5e7eb',
  grayDark: '#374151',
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const response = await fetch(`${API_URL}/backend/profile_api.php?user_id=${userId}`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Profil verisi çekilemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user_id');
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      {/* Header (Absolute) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{flexDirection: 'row', gap: 8}}>
             <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
                <MaterialIcons name="logout" size={24} color="#ff4444" />
            </TouchableOpacity>
             <TouchableOpacity style={styles.iconButton} onPress={fetchProfile}>
                <MaterialIcons name="refresh" size={24} color="white" />
            </TouchableOpacity>
             <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/profile-edit')}>
                <MaterialIcons name="settings" size={24} color="white" />
            </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
            <Image
                source={{ uri: (profile.cover && profile.cover.length > 0) ? profile.cover : 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                style={styles.heroImage}
            />
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'transparent', isDark ? COLORS.backgroundDark : COLORS.backgroundLight]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />
            
            <View style={styles.heroContent}>
                <View style={styles.verifiedBadge}>
                     <MaterialIcons name="verified" size={16} color="white" />
                     <Text style={styles.verifiedText}>{profile.status}</Text>
                </View>
                <Text style={styles.userName}>{profile.name.replace(' ', '\n')}</Text>
                <View style={styles.userStats}>
                    <Text style={styles.userStatText}>{profile.position}</Text>
                    <View style={styles.statDot} />
                    <Text style={styles.userStatText}>Seviye {profile.level}</Text>
                </View>
            </View>
            
             <TouchableOpacity style={styles.editButton} onPress={() => router.push('/profile-edit')}>
                <MaterialIcons name="edit" size={28} color={COLORS.primary} />
            </TouchableOpacity>
        </View>

        {/* Statistics Card */}
        <View style={styles.statsCardContainer}>
             <View style={styles.statsCard}>
                  <View style={styles.decorativeBlur} />
                  
                  <View style={styles.cardHeader}>
                      <View>
                          <Text style={styles.cardTitle}>GENEL İSTATİSTİKLER</Text>
                          <Text style={styles.seasonText}>2023-24 Sezonu</Text>
                      </View>
                      <MaterialIcons name="bar-chart" size={24} color={isDark ? '#4b5563' : '#d1d5db'} />
                  </View>

                  <View style={styles.statsGrid}>
                      <View style={styles.statItem}>
                          <Text style={styles.statValue}>{profile.stats.matches}</Text>
                          <View style={styles.statLabelContainer}>
                              <MaterialIcons name="sports-soccer" size={20} color={COLORS.primary} />
                              <Text style={styles.statLabel}>MAÇ</Text>
                          </View>
                      </View>
                      <View style={styles.statItem}>
                          <Text style={[styles.statValue, { color: COLORS.primary }]}>{profile.stats.goals}</Text>
                           <View style={styles.statLabelContainer}>
                              <MaterialIcons name="sports-score" size={20} color={COLORS.gray} />
                              <Text style={styles.statLabel}>GOL</Text>
                          </View>
                      </View>
                       <View style={styles.statItem}>
                          <Text style={styles.statValue}>{profile.stats.assists}</Text>
                           <View style={styles.statLabelContainer}>
                              <MaterialIcons name="handshake" size={20} color={COLORS.primary} />
                              <Text style={styles.statLabel}>ASİST</Text>
                          </View>
                      </View>
                       <View style={styles.statItem}>
                          <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                               <Text style={styles.statValue}>{profile.stats.fairplay}</Text>
                               <MaterialIcons name="star" size={24} color="#facc15" />
                          </View>
                           <View style={styles.statLabelContainer}>
                              <Text style={styles.statLabel}>FAIR PLAY</Text>
                          </View>
                      </View>
                  </View>
             </View>
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
             <View style={styles.sectionHeader}>
                 <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                     <View style={styles.sectionIndicator} />
                     <Text style={styles.sectionTitle}>Son Etkinlikler</Text>
                 </View>
                 <TouchableOpacity style={styles.arrowButton} onPress={() => router.push('/matches')}>
                     <MaterialIcons name="arrow-forward" size={14} color={COLORS.primary} />
                 </TouchableOpacity>
             </View>

             <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activitiesScroll}>
                 {profile.history.map((item: any) => (
                    <ActivityCard 
                        key={item.id}
                        isDark={isDark}
                        image={item.image_url || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"}
                        date={item.date}
                        icon={item.icon}
                        iconColor={item.color}
                        title={item.title}
                        subtitle={item.subtitle}
                        onPress={() => router.push({
                            pathname: '/event-details',
                            params: { title: `${item.title} ${item.subtitle}`, location: 'Stadyum', time: item.date }
                        })}
                    />
                 ))}
             </ScrollView>
        </View>

      </ScrollView>
    </View>
  );
}

const ActivityCard = ({ isDark, image, date, icon, iconColor, title, subtitle, onPress }: any) => {
    const styles = getStyles(isDark);
    return (
        <TouchableOpacity style={styles.activityCard} onPress={onPress}>
            <Image source={{ uri: image }} style={styles.activityImage} />
            <LinearGradient 
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']} 
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.dateBadge}>
                <Text style={styles.dateText}>{date}</Text>
            </View>
            <View style={styles.activityContent}>
                <MaterialIcons name={icon as any} size={36} color={iconColor} style={{marginBottom: 8}} />
                <Text style={styles.activityTitleText}>{title}</Text>
                <Text style={styles.activityTitleText}>{subtitle}</Text>
            </View>
        </TouchableOpacity>
    );
};

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? COLORS.backgroundDark : COLORS.backgroundLight,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  heroSection: {
    height: height * 0.65,
    minHeight: 500,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    paddingHorizontal: 24,
    paddingBottom: 32,
    zIndex: 10,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(23, 217, 97, 0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  userName: {
    fontSize: 56,
    fontWeight: '900',
    color: 'white',
    lineHeight: 56,
    letterSpacing: -1,
    marginBottom: 8,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  userStatText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 18,
    fontWeight: '500',
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  editButton: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statsCardContainer: {
    paddingHorizontal: 16,
    marginTop: -24,
    zIndex: 20,
  },
  statsCard: {
    backgroundColor: isDark ? COLORS.surfaceDark : COLORS.surfaceLight,
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'white',
    overflow: 'hidden',
    position: 'relative',
  },
  decorativeBlur: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(23, 217, 97, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gray,
    letterSpacing: 2,
  },
  seasonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  statItem: {
    width: '45%',
    gap: 4,
  },
  statValue: {
    fontSize: 56,
    fontWeight: '900',
    color: isDark ? COLORS.textDark : '#111827',
    lineHeight: 60,
    letterSpacing: -2,
  },
  statLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  activitiesSection: {
    marginTop: 40,
    paddingLeft: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 24,
    marginBottom: 20,
  },
  sectionIndicator: {
    width: 6,
    height: 24,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activitiesScroll: {
    paddingRight: 24,
    gap: 16,
    paddingBottom: 24,
  },
  activityCard: {
    width: 240,
    height: 360,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#333',
  },
  activityImage: {
    width: '100%',
    height: '100%',
  },
  dateBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  dateText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityContent: {
    position: 'absolute',
    bottom: 24,
    left: 24,
  },
  activityTitleText: {
    fontSize: 30,
    fontWeight: '900',
    color: 'white',
    lineHeight: 30,
    fontStyle: 'italic',
    textTransform: 'uppercase',
  },
});
