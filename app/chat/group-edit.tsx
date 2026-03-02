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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiGet, apiPost } from '@/constants/api';
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

export default function GroupEditScreen() {
  const { id } = useLocalSearchParams(); // conversation_id
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [participants, setParticipants] = useState<any[]>([]);
  const [newMemberUsername, setNewMemberUsername] = useState('');

  useEffect(() => {
    fetchGroupInfo();
  }, [id]);

  const fetchGroupInfo = async () => {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) { setLoading(false); return; }
    const { ok, data } = await apiGet(`/backend/messages_api.php?endpoint=group_info&conversation_id=${id}&user_id=${userId}`);
    if (ok && data?.group) {
      setGroupName(data.group.name || '');
      setParticipants(Array.isArray(data.participants) ? data.participants : []);
    }
    setLoading(false);
  };

  const handleUpdateName = async () => {
    const { ok, error } = await apiPost('/backend/messages_api.php?endpoint=update_group', {
      conversation_id: id,
      name: groupName,
    });
    if (ok) {
      Alert.alert('Başarılı', 'Grup ismi güncellendi');
    } else {
      Alert.alert('Hata', error || 'Güncelleme başarısız');
    }
  };

  const handleAddMember = async () => {
      if (!newMemberUsername) return;
      const { ok, error } = await apiPost('/backend/messages_api.php?endpoint=add_member', {
        conversation_id: id,
        username: newMemberUsername,
      });
      if (ok) {
        setNewMemberUsername('');
        fetchGroupInfo();
        Alert.alert('Başarılı', 'Üye eklendi');
      } else {
        Alert.alert('Hata', error || 'Kullanıcı bulunamadı');
      }
  };

  const handleRemoveMember = async (memberId: number) => {
      const { ok, error } = await apiPost('/backend/messages_api.php?endpoint=remove_member', {
        conversation_id: id,
        user_id: memberId,
      });
      if (ok) {
        fetchGroupInfo();
      } else {
        Alert.alert('Hata', error || 'Silme başarısız');
      }
  };

  if (loading) return <ActivityIndicator style={{marginTop: 50}} size="large" color={COLORS.primary} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grup Ayarları</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
          {/* Group Name */}
          <View style={styles.section}>
              <Text style={styles.label}>Grup İsmi</Text>
              <View style={styles.inputRow}>
                  <TextInput 
                    style={styles.input}
                    value={groupName}
                    onChangeText={setGroupName}
                    placeholder="Grup ismi"
                  />
                  <TouchableOpacity style={styles.saveButton} onPress={handleUpdateName}>
                      <MaterialIcons name="save" size={24} color="white" />
                  </TouchableOpacity>
              </View>
          </View>

          {/* Add Member */}
          <View style={styles.section}>
              <Text style={styles.label}>Üye Ekle (Kullanıcı Adı)</Text>
              <View style={styles.inputRow}>
                  <TextInput 
                    style={styles.input}
                    value={newMemberUsername}
                    onChangeText={setNewMemberUsername}
                    placeholder="Kullanıcı adı girin..."
                    autoCapitalize="none"
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddMember}>
                      <MaterialIcons name="person-add" size={24} color="white" />
                  </TouchableOpacity>
              </View>
          </View>

          {/* Participants List */}
          <View style={styles.section}>
              <Text style={styles.label}>Katılımcılar ({participants.length})</Text>
              {participants.map((p) => (
                  <View key={p.id} style={styles.participantRow}>
                      <Image 
                        source={{ uri: p.avatar_url || `https://ui-avatars.com/api/?name=${p.full_name}` }} 
                        style={styles.avatar} 
                      />
                      <View style={{flex: 1}}>
                          <Text style={styles.pName}>{p.full_name}</Text>
                          <Text style={styles.pUsername}>@{p.username}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemoveMember(p.id)}>
                          <MaterialIcons name="remove-circle-outline" size={24} color="#ef4444" />
                      </TouchableOpacity>
                  </View>
              ))}
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundLight },
  header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#e5e7eb'
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  backButton: { padding: 4 },
  content: { padding: 16, gap: 24 },
  section: { gap: 8 },
  label: { fontSize: 14, fontWeight: 'bold', color: COLORS.gray },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
      flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb',
      borderRadius: 8, padding: 12, fontSize: 16
  },
  saveButton: {
      backgroundColor: COLORS.primary, width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 8
  },
  addButton: {
      backgroundColor: '#3b82f6', width: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 8
  },
  participantRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'white',
      padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6'
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  pName: { fontWeight: 'bold', fontSize: 14 },
  pUsername: { fontSize: 12, color: COLORS.gray }
});