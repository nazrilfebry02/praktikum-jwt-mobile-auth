import { useEffect } from 'react';
import { Stack, router, Redirect } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../../context/AuthContext';

export default function AppLayout() {
  const { token, loading } = useAuth();

  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notifikasi diterima:', notification.request.content);
      }
    );
    const response = Notifications.addNotificationResponseReceivedListener(
      (event) => {
        const screen = event.notification.request.content.data?.screen;
        if (screen === 'profile') {
          router.push('/profile');
        }
      }
    );
    return () => {
      received.remove();
      response.remove();
    };
  }, []);

  if (loading) return null;
  if (!token) return <Redirect href="/sign-in" />;

  return <Stack />;
}
