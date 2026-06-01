import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from './api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  // iOS Simulator can't receive remote push. Android emulator (with Google Play) can.
  if (!Device.isDevice && Platform.OS === 'ios') {
    console.log('[notifications] Skipping — iOS Simulator cannot receive remote push.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily-reminder', {
      name: 'Günlük Hatırlatıcı',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#059669',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[notifications] Permission denied.');
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return tokenResponse.data;
  } catch (err) {
    console.error('[notifications] Failed to get Expo push token:', err);
    return null;
  }
}

export async function syncPushTokenWithBackend(): Promise<void> {
  const token = await registerForPushNotifications();
  if (!token) return;

  try {
    await api.post('/notifications/push-token', { pushToken: token });
  } catch (err) {
    console.error('[notifications] Failed to sync push token with backend:', err);
  }
}

export async function clearPushTokenOnBackend(): Promise<void> {
  try {
    await api.delete('/notifications/push-token');
  } catch (err) {
    console.error('[notifications] Failed to clear push token on backend:', err);
  }
}
