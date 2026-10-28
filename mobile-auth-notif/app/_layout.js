import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../context/AuthContext';

function Navigator() {
  const { token, loading } = useAuth();
  if (loading) return null;

  if (Stack.Protected) {
    return (
      <Stack>
        <Stack.Protected guard={!token}>
          <Stack.Screen name="sign-in" options={{ title: 'Login' }} />
          <Stack.Screen name="register" options={{ title: 'Daftar' }} />
        </Stack.Protected>
        <Stack.Protected guard={!!token}>
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="sign-in" options={{ title: 'Login' }} />
      <Stack.Screen name="register" options={{ title: 'Daftar' }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Navigator />
    </AuthProvider>
  );
}
