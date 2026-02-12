import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '@/constants/Config';

export default function TestApiScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // NOT: API_URL'in sonuna '/backend/users_api.php' ekliyoruz.
      // Eğer API_URL 'http://localhost' ise, tam adres 'http://localhost/backend/users_api.php' olur.
      const url = `${API_URL}/backend/users_api.php`; 
      console.log('Fetching:', url);
      
      const response = await fetch(url);
      const json = await response.json();

      if (json.status === 'success') {
        setUsers(json.data);
      } else {
        setError(json.message || 'Bir hata oluştu');
      }
    } catch (err: any) {
      setError(err.message || 'Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? '#101010' : '#fff' }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: isDark ? '#fff' : '#000' }}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#101010' : '#fff' }]}>
      <Text style={[styles.header, { color: isDark ? '#fff' : '#000' }]}>Kullanıcı API Testi</Text>
      
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Hata: {error}</Text>
          <Text style={[styles.hint, { color: isDark ? '#ccc' : '#666' }]}>
             Lütfen constants/Config.ts dosyasındaki API_URL'in doğru olduğundan emin olun.
          </Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: isDark ? '#202020' : '#f9f9f9' }]}>
              <Text style={[styles.name, { color: isDark ? '#fff' : '#000' }]}>{item.full_name}</Text>
              <Text style={{ color: isDark ? '#aaa' : '#555' }}>@{item.username}</Text>
              <Text style={{ color: isDark ? '#aaa' : '#555' }}>{item.email}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorBox: {
    padding: 20,
    backgroundColor: '#ffdddd',
    borderRadius: 8,
  },
  errorText: {
    color: '#d8000c',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    marginTop: 10,
    fontSize: 14,
  }
});
