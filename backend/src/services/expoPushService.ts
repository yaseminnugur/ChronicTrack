/**
 * Expo Push Notification helper.
 * Sends notifications via Expo's Push API (https://exp.host/--/api/v2/push/send).
 * Expo relays to FCM (Android) / APNs (iOS) under the hood.
 *
 * Docs: https://docs.expo.dev/push-notifications/sending-notifications/
 */

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const BATCH_SIZE = 100; // Expo limit per request

export interface ExpoPushMessage {
  to: string;                // Expo push token (ExponentPushToken[...])
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
  channelId?: string;        // Android notification channel
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  id?: string;
  message?: string;
  details?: { error?: string };
}

interface ExpoPushResponse {
  data: ExpoPushTicket[];
}

/**
 * Sends one or more push notifications via Expo Push API.
 * Invalid tokens are logged and skipped — caller may use the returned tickets
 * to detect DeviceNotRegistered errors and clean stale tokens.
 */
export async function sendExpoPush(messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> {
  if (messages.length === 0) return [];

  const tickets: ExpoPushTicket[] = [];

  // Send in batches of 100 (Expo's max per request)
  for (let i = 0; i < messages.length; i += BATCH_SIZE) {
    const batch = messages.slice(i, i + BATCH_SIZE);

    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          batch.map((m) => ({
            sound: m.sound ?? 'default',
            priority: m.priority ?? 'high',
            ...m,
          }))
        ),
      });

      if (!response.ok) {
        console.error(`Expo push API HTTP ${response.status}:`, await response.text());
        continue;
      }

      const result = (await response.json()) as ExpoPushResponse;
      tickets.push(...result.data);

      // Log any individual errors (e.g. DeviceNotRegistered)
      result.data.forEach((ticket, idx) => {
        if (ticket.status === 'error') {
          console.warn(
            `Expo push error for ${batch[idx].to}: ${ticket.message} (${ticket.details?.error})`
          );
        }
      });
    } catch (err) {
      console.error('Expo push API call failed:', err);
    }
  }

  return tickets;
}
