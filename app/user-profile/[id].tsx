import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { API_URL } from '@/constants/Config';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primary: '#17d961',
  backgroundLight: '#f6f8f7',
  backgroundDark: '#112117',
  textLight: '#0e1b13',
  textDark: '#ffffff',
  gray: '#9ca3af',
};

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/backend/profile_api.php?user_id=${id}`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{marginTop: 50}} size="large" color={COLORS.primary} />;
  if (!profile) return <View style={styles.container}><Text>Kullanıcı bulunamadı</Text></View>;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
            <Image
                source={{ uri: (profile.cover && profile.cover.length > 0) ? profile.cover : 'https://images.unsplash.com/photo-1522778119026-d647f0565c6a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                style={styles.heroImage}
            />
            <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'transparent', COLORS.backgroundLight]}
                style={StyleSheet.absoluteFillObject}
            />
            
            <View style={styles.heroContent}>
                <Image 
                    source={{ uri: (profile.avatar && profile.avatar.length > 0) ? profile.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}` }} 
                    style={styles.avatar} 
                />
                <Text style={styles.userName}>{profile.name}</Text>
                <Text style={styles.userStats}>{profile.position} • Seviye {profile.level}</Text>
            </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.stats.matches}</Text>
                <Text style={styles.statLabel}>MAÇ</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.stats.goals}</Text>
                <Text style={styles.statLabel}>GOL</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statValue}>{profile.stats.assists}</Text>
                <Text style={styles.statLabel}>ASİST</Text>
            </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hakkında</Text>
            <Text style={styles.bioText}>{profile.stats.bio || 'Henüz biyografi eklenmemiş.'}</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundLight },
  header: { position: 'absolute', top: 50, left: 16, zIndex: 10 },
  iconButton: { padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  heroSection: { height: 300, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroContent: { position: 'absolute', bottom: 20, left: 20, alignItems: 'center', flexDirection: 'row', gap: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: 'white' },
  userName: { fontSize: 24, fontWeight: 'bold', color: 'black' }, // Background light olduğu için black
  userStats: { fontSize: 14, color: COLORS.gray, marginTop: 4 }, // Düzenleme gerekebilir
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 20, backgroundColor: 'white', margin: 16, borderRadius: 16, elevation: 2 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: COLORS.gray },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  bioText: { fontSize: 14, color: '#333', lineHeight: 20 },
});