import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getMe } from '../../services/authService';

export default function ProfileScreen() {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (token) {
      getMe(token).then(setProfile).catch(console.error);
    }
  }, [token]);

  if (!profile) {
    return <ActivityIndicator style={{ flex: 1 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.item}>Nama: {profile.nama}</Text>
      <Text style={styles.item}>Email: {profile.email}</Text>
      <Text style={styles.item}>ID: {profile.id}</Text>
      {profile.dibuat_pada ? (
        <Text style={styles.item}>Dibuat: {profile.dibuat_pada}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 12,
    justifyContent: 'center',
  },
  item: {
    fontSize: 18,
  },
});
