import cron from 'node-cron';
import prisma from '../db.ts';
import { sendExpoPush, type ExpoPushMessage } from './expoPushService.ts';

/**
 * Daily reminder cron job.
 * Runs every day at 09:00 Europe/Istanbul and sends a measurement
 * reminder to all users who have a registered Expo push token.
 *
 * Cron expression: '0 9 * * *' = minute 0 of hour 9, every day.
 */

const REMINDER_TITLE = 'ChronicTrack';
const REMINDER_BODY = 'Bugünkü sağlık ölçümünü yapmayı unutma! 📋';
// TEST MODE: '*/1 * * * *' = her dakika. Production: '0 9 * * *'
const SCHEDULE = '*/1 * * * *';
const TZ = 'Europe/Istanbul';

export async function sendDailyReminders(): Promise<{ sent: number; failed: number }> {
  const users = await prisma.user.findMany({
    where: { pushToken: { not: null } },
    select: { id: true, pushToken: true },
  });

  if (users.length === 0) {
    console.log('[daily-reminder] No users with push tokens registered.');
    return { sent: 0, failed: 0 };
  }

  const messages: ExpoPushMessage[] = users.map((u) => ({
    to: u.pushToken!,
    title: REMINDER_TITLE,
    body: REMINDER_BODY,
    data: { type: 'daily_reminder' },
    channelId: 'daily-reminder',
  }));

  const tickets = await sendExpoPush(messages);
  const failed = tickets.filter((t) => t.status === 'error').length;
  const sent = tickets.length - failed;

  console.log(`[daily-reminder] ${sent} sent, ${failed} failed (of ${users.length} users).`);
  return { sent, failed };
}

export function startDailyReminderCron(): void {
  cron.schedule(
    SCHEDULE,
    () => {
      sendDailyReminders().catch((err) => {
        console.error('[daily-reminder] Job failed:', err);
      });
    },
    { timezone: TZ }
  );
  console.log(`[daily-reminder] Cron scheduled for "${SCHEDULE}" (${TZ}).`);
}
