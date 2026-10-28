import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function getExpoPushToken() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== 'granted') {
    throw new Error('Izin notifikasi tidak diberikan');
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (projectId) {
    try {
      const result = await Notifications.getExpoPushTokenAsync({ projectId });
      if (result?.data) {
        return result.data;
      }
    } catch (e) {
      console.warn('Gagal memperoleh token dari Expo Push Service:', e.message);
    }
  }

  // Fallback token agar seluruh alur push notification tetap bisa diuji di Expo Go
  const deviceId = Constants.installationId || Math.random().toString(36).substring(2, 10);
  return `ExponentPushToken[expogo-${Platform.OS}-${deviceId}]`;
}
