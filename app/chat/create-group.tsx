import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { API_URL } from '@/constants/Config';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#13ec5b',
  backgroundLight: '#f6f8f6',
  backgroundDark: '#102216',
  surfaceLight: '#ffffff',
  surfaceDark: '#1a2e22',
  textLight: '#111813',
  textDark: '#ffffff',
  gray: '#9ca3af',
};

export default function CreateGroupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/backend/users_api.php`);
      const data = await response.json();
      if (data.status === 'success') {
        // Kendimizi listeden çıkaralım
        const currentUserId = await AsyncStorage.getItem('user_id');
        const filtered = data.data.filter((u: any) => u.id != currentUserId);
        setUsers(filtered);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (id: number) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(uid => uid !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Uyarı', 'Lütfen grup ismi girin.');
      return;
    }
    if (selectedUsers.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir kişi seçin.');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('user_id');
      const participants = [parseInt(userId!), ...selectedUsers];

      const response = await fetch(`${API_URL}/backend/messages_api.php?endpoint=create_conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: groupName, participants })
      });
      const data = await response.json();
      if (data.status === 'success') {
        router.replace(`/chat/${data.conversation_id}`);
      } else {
        Alert.alert('Hata', data.message || 'Grup oluşturulamadı');
      }
    } catch (e) {
      Alert.alert('Hata', 'Bağlantı hatası');
    }
  };

  const filteredUsers = searchQuery.length > 0 ? users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yeni Grup</Text>
        <TouchableOpacity onPress={handleCreateGroup}>
            <Text style={styles.createButtonText}>Oluştur</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
          <Text style={styles.label}>Grup İsmi</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Grup ismi girin..." 
            value={groupName}
            onChangeText={setGroupName}
          />
      </View>

      <View style={styles.inputContainer}>
          <Text style={styles.label}>Katılımcılar</Text>
          <TextInput 
            style={styles.searchInput} 
            placeholder="Kişi ara..." 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
      </View>

      <ScrollView contentContainerStyle={styles.userList}>
          {loading ? (
              <ActivityIndicator color={COLORS.primary} />
          ) : (
              filteredUsers.map(user => (
                  <TouchableOpacity key={user.id} style={styles.userRow} onPress={() => toggleUser(user.id)}>
                      <Image 
                        source={{ uri: user.avatar_url || `https://ui-avatars.com/api/?name=${user.full_name}` }} 
                        style={styles.avatar} 
                      />
                      <View style={{flex: 1}}>
                          <Text style={styles.userName}>{user.full_name}</Text>
                          <Text style={styles.userHandle}>@{user.username}</Text>
                      </View>
                      <View style={[styles.checkbox, selectedUsers.includes(user.id) && styles.checkboxSelected]}>
                          {selectedUsers.includes(user.id) && <MaterialIcons name="check" size={16} color="white" />}
                      </View>
                  </TouchableOpacity>
              ))
          )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      padding: 16, borderBottomWidth: 1, borderColor: '#f3f4f6'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 4 },
  createButtonText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 16 },
  inputContainer: { padding: 16, paddingBottom: 0 },
  label: { fontSize: 14, fontWeight: 'bold', color: COLORS.gray, marginBottom: 8 },
  input: {
      backgroundColor: '#f9fafb', padding: 12, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb'
  },
  searchInput: {
      backgroundColor: '#f9fafb', padding: 12, borderRadius: 12, fontSize: 14, borderWidth: 1, borderColor: '#e5e7eb'
  },
  userList: { padding: 16, gap: 12 },
  userRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12,
      backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6'
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  userName: { fontWeight: 'bold', fontSize: 14 },
  userHandle: { fontSize: 12, color: COLORS.gray },
  checkbox: {
      width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#e5e7eb',
      alignItems: 'center', justifyContent: 'center'
  },
  checkboxSelected: {
      backgroundColor: COLORS.primary, borderColor: COLORS.primary
  }
});