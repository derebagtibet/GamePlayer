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
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

const COLORS = {
  primary: '#13ec5b',
  backgroundLight: '#f6f8f6',
  backgroundDark: '#102216',
  surfaceLight: '#ffffff',
  surfaceDark: '#1a2e22',
  textLight: '#111813',
  textDark: '#ffffff',
  gray: '#9ca3af',
  grayLight: '#e5e7eb',
  grayDark: '#374151',
};

export default function EventDetailsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = getStyles(isDark);
  const router = useRouter();
  const params = useLocalSearchParams();

  const title = params.title || 'Halı Saha Maçı';
  const location = params.location || 'Kadıköy';
  const time = params.time || '14 Ekim, 20:00 - 21:00';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={24} color={isDark ? COLORS.textDark : COLORS.textLight} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>{title}</Text>
            <Text style={styles.headerSubtitle}>{time}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="more-vert" size={24} color={isDark ? COLORS.textDark : COLORS.textLight} />
        </TouchableOpacity>
      </View>

      <View style={{flex: 1}}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <MaterialIcons name="search" size={20} color={COLORS.gray} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Oyuncu ara..."
                        placeholderTextColor={COLORS.gray}
                    />
                </View>
            </View>

            {/* Filter Chips */}
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
                        <Text style={[styles.filterChipText, styles.filterChipTextActive]}>Tümü</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Text style={styles.filterChipText}>Kaleci</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Text style={styles.filterChipText}>Defans</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Text style={styles.filterChipText}>Orta Saha</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Text style={styles.filterChipText}>Forvet</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* Section Title */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Kadro</Text>
                <View style={styles.countBadge}>
                    <Text style={styles.countText}>8/14</Text>
                </View>
            </View>

            {/* Participants List */}
            <View style={styles.listContainer}>
                {/* Organizer */}
                <View style={[styles.participantCard, styles.organizerCard]}>
                    <View style={styles.avatarContainer}>
                         <Image 
                            source={{ uri: 'https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=random' }} 
                            style={styles.avatar} 
                        />
                        <View style={styles.starBadge}>
                             <MaterialIcons name="star" size={14} color="#111813" />
                        </View>
                    </View>
                    <View style={styles.participantInfo}>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                             <Text style={styles.participantName}>Ahmet Yılmaz</Text>
                             <View style={styles.roleBadgeOrganizer}>
                                 <Text style={styles.roleTextOrganizer}>ORGANIZATÖR</Text>
                             </View>
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                            <MaterialIcons name="sports-soccer" size={16} color={COLORS.gray} />
                            <Text style={styles.positionText}>Orta Saha</Text>
                        </View>
                    </View>
                    <View style={styles.participantStats}>
                        <Text style={styles.ratingText}>⭐ 4.9</Text>
                        <Text style={styles.levelText}>Seviye 8</Text>
                    </View>
                </View>

                {/* Player 1 */}
                <View style={styles.participantCard}>
                    <Image 
                        source={{ uri: 'https://ui-avatars.com/api/?name=Mehmet+Demir&background=random' }} 
                        style={styles.avatar} 
                    />
                    <View style={styles.participantInfo}>
                        <Text style={styles.participantName}>Mehmet Demir</Text>
                        <View style={[styles.roleBadge, { backgroundColor: isDark ? 'rgba(30, 58, 138, 0.3)' : '#dbeafe' }]}>
                             <Text style={[styles.roleText, { color: isDark ? '#93c5fd' : '#1d4ed8' }]}>Kaleci</Text>
                        </View>
                    </View>
                    <View style={styles.participantActions}>
                         <Text style={styles.ratingText}>⭐ 4.5</Text>
                         <TouchableOpacity style={styles.chatButton}>
                            <MaterialIcons name="chat-bubble" size={18} color={COLORS.gray} />
                         </TouchableOpacity>
                    </View>
                </View>

                {/* Player 2 */}
                <View style={styles.participantCard}>
                    <Image 
                        source={{ uri: 'https://ui-avatars.com/api/?name=Elif+Kaya&background=random' }} 
                        style={styles.avatar} 
                    />
                    <View style={styles.participantInfo}>
                        <Text style={styles.participantName}>Elif Kaya</Text>
                        <View style={[styles.roleBadge, { backgroundColor: isDark ? 'rgba(127, 29, 29, 0.3)' : '#fee2e2' }]}>
                             <Text style={[styles.roleText, { color: isDark ? '#fca5a5' : '#b91c1c' }]}>Forvet</Text>
                        </View>
                    </View>
                    <View style={styles.participantActions}>
                         <Text style={styles.ratingText}>⭐ 5.0</Text>
                         <TouchableOpacity style={styles.chatButton}>
                            <MaterialIcons name="chat-bubble" size={18} color={COLORS.gray} />
                         </TouchableOpacity>
                    </View>
                </View>

                 {/* Player 3 */}
                <View style={styles.participantCard}>
                    <Image 
                        source={{ uri: 'https://ui-avatars.com/api/?name=Caner+Erkin&background=random' }} 
                        style={styles.avatar} 
                    />
                    <View style={styles.participantInfo}>
                        <Text style={styles.participantName}>Caner Erkin</Text>
                        <View style={[styles.roleBadge, { backgroundColor: isDark ? 'rgba(20, 83, 45, 0.3)' : '#dcfce7' }]}>
                             <Text style={[styles.roleText, { color: isDark ? '#86efac' : '#166534' }]}>Defans</Text>
                        </View>
                    </View>
                    <View style={styles.participantActions}>
                         <Text style={styles.ratingText}>⭐ 4.2</Text>
                         <TouchableOpacity style={styles.chatButton}>
                            <MaterialIcons name="chat-bubble" size={18} color={COLORS.gray} />
                         </TouchableOpacity>
                    </View>
                </View>

                 {/* Invite Placeholder */}
                 <View style={styles.invitePlaceholder}>
                     <View style={styles.inviteIconCircle}>
                         <MaterialIcons name="group-add" size={24} color={COLORS.primary} />
                     </View>
                     <View style={{alignItems: 'center'}}>
                         <Text style={styles.inviteTitle}>Kadroyu Tamamla</Text>
                         <Text style={styles.inviteSubtitle}>Maçın başlamasına 6 oyuncu kaldı.</Text>
                     </View>
                 </View>

            </View>
          </ScrollView>
      </View>

      {/* Sticky Bottom CTA */}
      <View style={styles.footer}>
          <TouchableOpacity style={styles.inviteButton}>
              <MaterialIcons name="person-add" size={20} color="#102216" />
              <Text style={styles.inviteButtonText}>Arkadaş Davet Et</Text>
          </TouchableOpacity>
      </View>

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
    backgroundColor: isDark ? 'rgba(16, 34, 22, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.gray,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? COLORS.surfaceDark : 'white',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 16,
  },
  filterChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: isDark ? COLORS.surfaceDark : 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#111813',
    borderColor: '#111813',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: isDark ? '#e5e7eb' : COLORS.textLight,
  },
  filterChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  countBadge: {
    backgroundColor: 'rgba(19, 236, 91, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  countText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: isDark ? '#86efac' : '#166534',
  },
  listContainer: {
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 16,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? COLORS.surfaceDark : 'white',
    padding: 12,
    borderRadius: 12,
    gap: 16,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  organizerCard: {
    borderColor: 'rgba(19, 236, 91, 0.5)',
  },
  avatarContainer: {
    position: 'relative',
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5e7eb',
  },
  starBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: isDark ? COLORS.surfaceDark : 'white',
  },
  participantInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  participantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  roleBadgeOrganizer: {
    backgroundColor: isDark ? '#374151' : '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleTextOrganizer: {
    fontSize: 10,
    fontWeight: 'bold',
    color: isDark ? '#d1d5db' : '#4b5563',
  },
  positionText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  participantStats: {
    alignItems: 'flex-end',
  },
  participantActions: {
      alignItems: 'flex-end',
      gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  levelText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  chatButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: isDark ? '#374151' : '#f9fafb',
  },
  invitePlaceholder: {
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: isDark ? '#374151' : '#e5e7eb',
    borderStyle: 'dashed',
    backgroundColor: isDark ? 'rgba(26, 46, 34, 0.5)' : '#f9fafb',
    gap: 12,
  },
  inviteIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: isDark ? COLORS.textDark : COLORS.textLight,
  },
  inviteSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
  },
  footer: {
    padding: 16,
    backgroundColor: isDark ? COLORS.backgroundDark : 'white',
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inviteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#102216',
  },
});
