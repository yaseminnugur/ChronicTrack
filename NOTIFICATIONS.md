# ChronicTrack — Notification Sistemi

Sunucu kaynaklı (push) günlük ölçüm hatırlatıcısı. Expo Push Service kullanılır
(altında FCM ↔ APNs).

## Mimari

```
┌──────────────┐    1. login                ┌──────────────┐
│   Mobile     │───────────────────────────▶│   Backend    │
│  (Expo app)  │    2. POST                 │              │
│              │       /api/notifications   │  ┌────────┐  │
│              │       /push-token          │  │ Prisma │  │
│              │◀──────────────────────────▶│  └────────┘  │
└──────────────┘                            └──────┬───────┘
       ▲                                            │
       │                                            │ 3. node-cron
       │                                            │    her gün 09:00 (TR)
       │           4. Expo Push API                 ▼
       └────────────────────────────────────  exp.host/--/api/v2/push/send
```

1. Kullanıcı giriş yapınca uygulama izin ister, **Expo push token**'ı alır.
2. Token backend'e `POST /api/notifications/push-token` ile gönderilir,
   `User.pushToken` kolonuna yazılır.
3. Backend'de `node-cron` her gün **09:00 Europe/Istanbul** saatinde tetiklenir.
4. Cron, push token'ı olan tüm kullanıcılara Expo Push API üzerinden
   "Bugünkü sağlık ölçümünü yapmayı unutma" bildirimini gönderir.

## Backend Bileşenleri

| Dosya | Görev |
|---|---|
| `prisma/schema.prisma` | `User.pushToken` (String?) kolonu |
| `src/controllers/notificationController.ts` | `registerPushToken` / `removePushToken` |
| `src/routes/notificationRoutes.ts` | `POST` / `DELETE /api/notifications/push-token` |
| `src/services/expoPushService.ts` | Expo Push API HTTP client (100 batch limiti) |
| `src/services/dailyReminderJob.ts` | node-cron job: `0 9 * * *` Europe/Istanbul |
| `src/index.ts` | Sunucu açılışında `startDailyReminderCron()` |

### Migration

Yeni kolon için migration koşulmalı:

```bash
cd backend
npx prisma migrate dev --name add_user_push_token
npx prisma generate
```

### Yerel test (cron'u beklemeden)

Daily job fonksiyonu doğrudan çağrılabilir:

```ts
// REPL veya geçici script
import { sendDailyReminders } from './src/services/dailyReminderJob.ts';
await sendDailyReminders();
```

Veya cron expression'ı geçici olarak `'*/1 * * * *'` (her dakika) yapıp test edip
geri al.

## Frontend Bileşenleri

| Dosya | Görev |
|---|---|
| `app.json` | `expo-notifications` plugin'i (`defaultChannel: daily-reminder`) |
| `services/notificationService.ts` | `syncPushTokenWithBackend` / `clearPushTokenOnBackend` |
| `context/AuthContext.tsx` | `signIn` sonrası token sync; `signOut` öncesi token sil |

### Akış

1. **App açılışı:** AuthContext, AsyncStorage'da token varsa
   `syncPushTokenWithBackend()` çağırır → izin yoksa istenir, varsa token alınır,
   backend'e POST edilir.
2. **Sign-in:** Yeni giriş sonrası aynı sync çalışır.
3. **Sign-out:** Backend'den token silinir (önceki cihaz artık push almasın).

## Önemli: Expo Go Sınırı

> **Expo Go SDK 53+ uzaktan push notification'ı artık desteklemiyor.**
> https://docs.expo.dev/push-notifications/what-you-need-to-know/

Test için **EAS Dev Client** build edilmeli:

```bash
cd frontend/ChronicTrackApp
npx eas-cli build --profile development --platform android
# veya
npx eas-cli build --profile development --platform ios
```

Build'i fiziksel cihaza yükledikten sonra `npx expo start --dev-client` ile
çalıştırılır. Token alımı ve push teslimi sadece bu modda çalışır.

Local notification (uygulama içinden zamanlanmış) Expo Go'da çalışmaya
devam eder — ama biz tüm akışı backend-driven push olarak kurguladık.

## Token Yaşam Döngüsü

- **Geçerli format:** `ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]`
- Cihaz fabrika ayarı / app yeniden kurulum → eski token geçersiz olur.
- Backend, Expo'dan dönen ticket'ta `DeviceNotRegistered` hatası alırsa o
  token'ı temizlemeli (şu an log atılıyor; ileride otomatik temizlik
  eklenebilir).
- Sign-out'ta token backend'den silinir.

## Manuel Test Checklist

- [ ] `npx prisma migrate dev` çalıştırıldı, `User.pushToken` var.
- [ ] Backend açılışında log: `[daily-reminder] Cron scheduled for "0 9 * * *" (Europe/Istanbul).`
- [ ] EAS dev client build'i cihaza kuruldu.
- [ ] Sign-in sonrası izin dialog'u göründü, "İzin ver" → uygulama hata vermedi.
- [ ] Backend log: token kaydedildi (DB'de `User.pushToken` dolu).
- [ ] `sendDailyReminders()` manuel çağrıldı → cihaza bildirim düştü.
- [ ] Sign-out yapıldı → DB'de `pushToken` `null` oldu.

## İleride Eklenebilecekler

- Kullanıcı ayarları ekranı: hatırlatıcı saatini değiştirme, AÇIK/KAPALI toggle
- Birden fazla hatırlatıcı (sabah + akşam)
- AI analiz hazır olduğunda anlık push
- Stale token cleanup (Expo `DeviceNotRegistered` ticket'larından)
- Receipt poll (Expo bildirimi gerçekten gönderdi mi)
