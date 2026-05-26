# ChronicTrack — Test Rehberi

Bu doküman, uygulamanın kritik akışları için yazılan otomatik testlerin kapsamını ve nasıl çalıştırılacağını açıklar.

## Test Altyapısı

- **Test runner:** [Vitest](https://vitest.dev) (hem backend hem frontend)
- **Tip:** Unit (saf fonksiyon) testleri — DB / network / UI bağımlılığı yoktur
- **Lokasyon:** her modülün yanında `__tests__/` klasörü

Vitest seçilme sebebi: backend `"type": "module"` (ESM) + `.ts` uzantılı import path
kullanıyor; Vitest bunu yapılandırma gerektirmeden destekler.

## Çalıştırma

### Backend
```bash
cd backend
npm test               # tek seferlik koşum
npm run test:watch     # değişiklikleri izleyerek koşum
npm run test:coverage  # v8 coverage raporu (coverage/ klasörüne yazılır)
```

### Frontend
```bash
cd frontend/ChronicTrackApp
npm test               # tek seferlik koşum
npm run test:watch     # değişiklikleri izleyerek koşum
```

## Test Kapsamı

### Backend (`backend/src/**/__tests__/*.test.ts`)

| Modül | Test sayısı | Kapsam |
|---|---|---|
| `utils/numberUtils` | 15 | TR-locale virgül parse, fallback, edge case (boş/null/non-numeric) |
| `utils/healthValidation` | 23 | Tansiyon, kan şekeri, HbA1c için min/max sınırları, zorunluluk, sistolik > diastolik kuralı, sınır değerler |
| `services/analyzers/bloodPressureAnalyzer` | 15 | Normal / Elevated / Stage1 / Stage2 / Crisis sınıflandırma, risk seviyesi, morning hypertension, taşikardi, bradikardi, wide pulse pressure, sigara kombinasyonu, trend (worsening / improving / stable / insufficient), pencere filtresi |
| `services/analyzers/bloodSugarAnalyzer` | 15 | HbA1c sınıfları (normal/prediabetes/controlled/suboptimal/poor), ADA eAG formülü, severe hyperglycemia, frequent hypo, post-meal spike, low time-in-range, high variability, hba1c_mismatch sinyali, sadece-HbA1c baseline durumu, trend |

**Toplam:** 4 dosya, 68 test.

### Frontend (`frontend/ChronicTrackApp/**/__tests__/*.test.ts`)

| Modül | Test sayısı | Kapsam |
|---|---|---|
| `utils/numberUtils` | 14 | TR virgül normalleştirme, integer/decimal filter, safeParse fallback'leri |
| `utils/healthStatusUtils` | 18 | Glikoz / tansiyon / nabız / HbA1c için renk-kodlu durum etiketleri (Düşük / Normal / Yüksek Risk / Yüksek / Kriz), sınır değerler |
| `validations/healthValidation` | 22 | Form validasyonu: tek alan + tansiyon + kan şekeri (öğün durumu whitelist) + HbA1c, min/max, sistolik > diastolik, TR virgül desteği |
| `validations/auth` | 11 | Zod login/register şemaları: email format, şifre kuralları (büyük/küçük harf, uzunluk), şifre eşleşmesi |

**Toplam:** 4 dosya, 65 test.

## Medikal Referanslar (Tested Ranges)

Validasyon ve sınıflandırma testleri, kodda dokümante edilen klinik kılavuzlara
sadık kalır:

- **Tansiyon:** AHA Guidelines — sistolik 40–300 mmHg, diastolik 20–200 mmHg
- **Kan Şekeri (Glikoz):** ADA Standards of Care — 20–600 mg/dL
- **Nabız:** AHA — 20–300 BPM
- **HbA1c:** ADA — 3.0–20.0 %

## Edge Case'ler

Her validasyon/analyzer modülü için aşağıdaki sınır durumları test edilmiştir:

- Boş / null / undefined girişler
- Non-numeric girişler (`"abc"`, `"12abc"`)
- TR-locale virgüllü ondalık (`"7,5"`, `"120,5"`)
- Min ve max sınır değerleri (`40`, `300`, `20.0` vb.)
- Min'in 1 altı / max'ın 1 üstü
- Sistolik ≤ Diastolik kuralı
- Boş kayıt dizisi → LOW risk, INSUFFICIENT_DATA trend
- Pencere dışı kayıtların filtrelenmesi (örn. 60 gün önce → 30 günlük analize girmemeli)
- Sadece HbA1c, sadece günlük ölçüm, ikisi birlikte (hba1c_mismatch >25% gap)
- Kritik sinyaller (hypertensive crisis, severe hyperglycemia, frequent hypo) → CRITICAL risk

## CI Entegrasyonu (öneri)

Mevcut iki proje için tek bir job iki suite'i de koşabilir:

```yaml
# .github/workflows/test.yml
- run: npm ci && npm test
  working-directory: backend
- run: npm ci && npm test
  working-directory: frontend/ChronicTrackApp
```

## Yeni Test Eklemek

1. Test edilecek modülün bulunduğu klasörde `__tests__/` aç.
2. `<modül>.test.ts` adıyla dosya oluştur.
3. Vitest globals (`describe`, `it`, `expect`) — config'de `globals: true` ama
   yine de import edilmiş halde yazıldı; her iki kullanım da çalışır.
4. `npm run test:watch` ile yazarken anında geri bildirim al.
