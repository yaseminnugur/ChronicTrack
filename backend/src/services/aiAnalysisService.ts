import prisma from '../db.ts';
import { getOpenAIClient, OPENAI_MODEL } from './openaiClient.ts';
import { analyzeBloodSugar } from './analyzers/bloodSugarAnalyzer.ts';
import { analyzeBloodPressure } from './analyzers/bloodPressureAnalyzer.ts';
import type {
  AnalysisType,
  DeterministicAnalysis,
  UserProfileSummary,
} from './analyzers/types.ts';

const STALE_DAYS = 7;
const STALE_MS = STALE_DAYS * 24 * 60 * 60 * 1000;

export interface AINarrative {
  summary: string;              // doğal dil özet (2-4 cümle)
  recommendations: Array<{ title: string; detail: string; icon?: string }>;
  doctorAdvice: string | null;  // kritik durumda doktor uyarısı
}

export interface AnalysisResult {
  type: AnalysisType;
  generatedAt: Date;
  fromCache: boolean;
  cacheReason?: 'unchanged' | 'no_data';
  refreshReason?:
    | 'no_previous'
    | 'risk_changed'
    | 'trend_changed'
    | 'signals_changed'
    | 'new_measurements'
    | 'stale'
    | 'forced';
  deterministic: DeterministicAnalysis;
  ai: AINarrative;
}

export async function getOrGenerateAnalysis(
  userId: string,
  type: AnalysisType,
  options: { force?: boolean } = {}
): Promise<AnalysisResult> {
  const profile = await loadUserProfile(userId);
  const { deterministic, recentNotes } = await computeDeterministicWithContext(userId, type, profile);

  // Hiç değerlendirilebilir veri yoksa AI çağırma — boş narrative döndür.
  // Kan şekeri için: günlük ölçüm YOK ve HbA1c de YOK
  // Tansiyon için: hiçbir ölçüm yok (onboarding dahil)
  const hasData =
    deterministic.type === 'BLOOD_SUGAR'
      ? deterministic.hasBaselineData
      : deterministic.recordsConsidered > 0;

  if (!hasData) {
    return {
      type,
      generatedAt: new Date(),
      fromCache: true,
      cacheReason: 'no_data',
      deterministic,
      ai: {
        summary: type === 'BLOOD_SUGAR'
          ? 'Henüz analiz için yeterli veri yok. İlk kan şekeri ölçümlerinizi ekledikçe burada kişisel öneriler göreceksiniz.'
          : 'Henüz analiz için yeterli tansiyon ölçümünüz yok. İlk ölçümlerinizi ekledikçe burada kişisel öneriler göreceksiniz.',
        recommendations: [],
        doctorAdvice: null,
      },
    };
  }

  const last = await prisma.healthAnalysis.findFirst({
    where: { userId, analysisType: type },
    orderBy: { createdAt: 'desc' },
  });

  const refreshDecision = await decideRefresh(userId, type, last, deterministic, !!options.force);

  if (!refreshDecision.refresh && last) {
    return {
      type,
      generatedAt: last.createdAt,
      fromCache: true,
      cacheReason: 'unchanged',
      deterministic,
      ai: parseStoredAI(last.aiSummary, last.recommendation),
    };
  }

  // AI yenile
  const narrative = await generateAINarrative(deterministic, profile, recentNotes);
  const stored = await prisma.healthAnalysis.create({
    data: {
      userId,
      analysisType: type,
      status: deterministic.riskLevel,
      score: deterministicScore(deterministic),
      aiSummary: serializeAISummary(narrative),
      recommendation: serializeRecommendations(narrative),
    },
  });

  return {
    type,
    generatedAt: stored.createdAt,
    fromCache: false,
    refreshReason: refreshDecision.reason,
    deterministic,
    ai: narrative,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers

async function loadUserProfile(userId: string): Promise<UserProfileSummary> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { onboardingData: true },
  });
  if (!user) throw new Error('Kullanıcı bulunamadı');

  const weightKg = user.weight ?? null;
  const heightCm = user.height ?? null;
  const bmi =
    weightKg != null && heightCm != null && heightCm > 0
      ? Math.round((weightKg / Math.pow(heightCm / 100, 2)) * 10) / 10
      : null;

  return {
    age: user.age,
    weightKg,
    heightCm,
    bmi,
    isSmoking: user.isSmoking,
    activityLevel: user.activityLevel,
    saltLevel: user.saltLevel,
    diabetesType: user.onboardingData?.diabetesType ?? null,
    hba1c: user.onboardingData?.hba1c ?? null,
    chronicConditions: (user.chronicConditions || '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && s !== 'Hiçbiri'),
  };
}

/**
 * Kullanıcının ölçümlerine yazdığı notlardan AI için bağlam çıkarır.
 * Sadece son 10, boş olmayan notu döner (token tasarrufu).
 */
interface RecentNote {
  date: string;        // YYYY-MM-DD
  value: string;       // "165 mg/dL" veya "140/90 mmHg"
  mealState?: string;  // sadece BS için
  note: string;
}
const MAX_NOTES = 10;

async function computeDeterministicWithContext(
  userId: string,
  type: AnalysisType,
  profile: UserProfileSummary
): Promise<{ deterministic: DeterministicAnalysis; recentNotes: RecentNote[] }> {
  // 2x window al ki trend için önceki periyodu hesaplayabilelim.
  // 7 gün analiz penceresi → 14 günlük veri çekilir (current + previous).
  // Analyzer'lardaki DEFAULT_WINDOW_DAYS ile eşleşmeli.
  const windowDays = 7;
  const since = new Date(Date.now() - 2 * windowDays * 24 * 60 * 60 * 1000);

  if (type === 'BLOOD_SUGAR') {
    const records = await prisma.bloodSugar.findMany({
      where: { userId, measuredAt: { gte: since } },
      orderBy: { measuredAt: 'desc' },
    });
    const recentNotes: RecentNote[] = records
      .filter((r) => r.notes && r.notes.trim().length > 0)
      .slice(0, MAX_NOTES)
      .map((r) => ({
        date: toIsoDate(r.measuredAt),
        value: `${r.glucose} mg/dL`,
        mealState: r.mealState,
        note: r.notes!.trim(),
      }));
    return {
      deterministic: analyzeBloodSugar(records, profile, windowDays),
      recentNotes,
    };
  } else {
    const dbRecords = await prisma.bloodPressure.findMany({
      where: { userId, measuredAt: { gte: since } },
      orderBy: { measuredAt: 'desc' },
    });
    const records = dbRecords.map((r) => ({
      systolic: r.systolic,
      diastolic: r.diastolic,
      pulse: r.pulse,
      measuredAt: r.measuredAt,
    }));

    // Onboarding'de girilen tansiyon ölçümlerini de dahil et.
    // Bu ölçümler BloodPressure tablosunda olmasa da analizde sayılmalı —
    // aksi halde yeni kullanıcı onboarding sonrası "yeterli veri yok" görür.
    const onboarding = await prisma.onboardingData.findUnique({ where: { userId } });
    if (
      onboarding?.bloodPressureData &&
      Array.isArray(onboarding.bloodPressureData) &&
      onboarding.createdAt >= since
    ) {
      const onboardingRecords = (onboarding.bloodPressureData as any[])
        .map((bp) => ({
          systolic: Number(bp.sis),
          diastolic: Number(bp.dia),
          pulse: Number(bp.pulse) || 0,
          measuredAt: onboarding.createdAt,
        }))
        .filter((r) => Number.isFinite(r.systolic) && Number.isFinite(r.diastolic));
      records.push(...onboardingRecords);
    }

    const recentNotes: RecentNote[] = dbRecords
      .filter((r) => r.notes && r.notes.trim().length > 0)
      .slice(0, MAX_NOTES)
      .map((r) => ({
        date: toIsoDate(r.measuredAt),
        value: `${r.systolic}/${r.diastolic} mmHg`,
        note: r.notes!.trim(),
      }));

    return {
      deterministic: analyzeBloodPressure(records, profile, windowDays),
      recentNotes,
    };
  }
}

function toIsoDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

async function decideRefresh(
  userId: string,
  type: AnalysisType,
  last: { createdAt: Date; status: string; aiSummary: string } | null,
  current: DeterministicAnalysis,
  forced: boolean
): Promise<{ refresh: boolean; reason?: AnalysisResult['refreshReason'] }> {
  if (forced) return { refresh: true, reason: 'forced' };
  if (!last) return { refresh: true, reason: 'no_previous' };

  const age = Date.now() - last.createdAt.getTime();
  if (age > STALE_MS) return { refresh: true, reason: 'stale' };

  // Risk seviyesi değişti mi?
  if (last.status !== current.riskLevel) return { refresh: true, reason: 'risk_changed' };

  // Son analizden sonra yeni ölçüm eklendi mi?
  // Bu kontrol kritik: analiz penceresinde yapışkan sinyaller (severe_hyperglycemia,
  // frequent_hypo) nedeniyle riskLevel CRITICAL kalmaya devam edebilir. Yeni normal
  // ölçümler girildiğinde bile risk düşmediği için AI özeti güncellenmez. Yeni
  // ölçüm timestamp'ı son analizden büyükse cache'i invalide ederiz.
  const latestMeasurementAt = await getLatestMeasurementTime(userId, type);
  if (latestMeasurementAt && latestMeasurementAt > last.createdAt) {
    return { refresh: true, reason: 'new_measurements' };
  }

  return { refresh: false };
}

async function getLatestMeasurementTime(
  userId: string,
  type: AnalysisType
): Promise<Date | null> {
  if (type === 'BLOOD_SUGAR') {
    const latest = await prisma.bloodSugar.findFirst({
      where: { userId },
      orderBy: { measuredAt: 'desc' },
      select: { measuredAt: true },
    });
    return latest?.measuredAt ?? null;
  }
  // BLOOD_PRESSURE: hem normal kayıtları hem onboarding'i kapsa
  const [latestBp, onboarding] = await Promise.all([
    prisma.bloodPressure.findFirst({
      where: { userId },
      orderBy: { measuredAt: 'desc' },
      select: { measuredAt: true },
    }),
    prisma.onboardingData.findUnique({
      where: { userId },
      select: { createdAt: true, bloodPressureData: true },
    }),
  ]);
  const candidates: Date[] = [];
  if (latestBp?.measuredAt) candidates.push(latestBp.measuredAt);
  if (
    onboarding?.bloodPressureData &&
    Array.isArray(onboarding.bloodPressureData) &&
    (onboarding.bloodPressureData as any[]).length > 0
  ) {
    candidates.push(onboarding.createdAt);
  }
  if (candidates.length === 0) return null;
  return new Date(Math.max(...candidates.map((d) => d.getTime())));
}

async function generateAINarrative(
  deterministic: DeterministicAnalysis,
  profile: UserProfileSummary,
  recentNotes: RecentNote[]
): Promise<AINarrative> {
  const client = getOpenAIClient();

  const systemPrompt = `Sen ChronicTrack adlı kronik hastalık takip uygulamasının sağlık asistanısın.
Görevin: Backend'den gelen DETERMINISTIC sağlık analizini Türkçe doğal dile çevirmek, kullanıcıya kişiselleştirilmiş ve anlaşılır öneriler sunmak.

KURALLAR:
1. ASLA tıbbi tavsiye verme. "Tanı" veya "tedavi" kelimelerini kullanma.
2. Sayıları/risk seviyesini sen üretme — yalnızca verilen deterministic analizdeki rakamları kullan.
3. Risk CRITICAL veya hipertansif kriz/şiddetli hipoglisemi sinyali varsa, doctorAdvice alanına net şekilde "acilen sağlık kuruluşuna başvurun" yaz.
4. Risk HIGH ise doctorAdvice alanına "doktorunuzla görüşmenizi öneririz" yaz.
5. Risk LOW/MEDIUM için doctorAdvice null bırakılabilir.
6. recentNotes alanı kullanıcının ölçümlerine yazdığı serbest notları içerir. Bu notlar kişisel BAĞLAM sağlar (örn. "spor sonrası", "stres altındaydım", "ağır karbonhidrat"). Önerilerinde bu bağlamı kullan ve gerektiğinde özette atıfta bulun ("Spor sonrası ölçümlerinizin yüksek seyrettiği görülüyor" gibi). Ancak deterministicAnalysis öncelikli karar verici; notlar yalnızca renk katar, risk seviyesini değiştirmez.
6a. KAN ŞEKERİ ÖZEL DURUM: deterministicAnalysis.hba1c değeri varsa (3 aylık ortalama göstergesi), bunu özetinde anlamlandır. category alanına göre (normal/prediabetes/controlled/suboptimal/poor) durumu açıkla. Eğer signals içinde "hba1c_only_baseline" varsa, bu kullanıcının henüz günlük ölçüm girmediği anlamına gelir — özetinde sadece HbA1c bazında bilgi ver, "günlük ölçüm girdikçe daha detaylı analiz sunabileceğimizi" ekle, önerilerin de düzenli ölçüm alışkanlığı + HbA1c kategorisine göre yaşam tarzı olsun.
6b. KRİTİK OLAY TOPARLANMASI: deterministicAnalysis.criticalEvents alanında *_resolved (severeHyperglycemia.resolved=true / frequentHypo.resolved=true / hypertensiveCrisis.resolved=true) gördüğün anda bu, "geçmişte kritik bir değer vardı ancak ardışık normal ölçümlerle toparlanma sağlandı" anlamına gelir. Özetinde MUTLAKA bu bağlamı ver. ÇOK ÖNEMLİ — ZAMAN İFADESİ KURALI: Asla "X dk önce / X saat önce / X gün önce / X hafta önce / dün / bugün / yakın zamanda / önceki gün" gibi SPESİFİK ZAMAN ifadeleri kullanma. lastOccurredAt veya lastOccurredAgo alanlarına BAKMA, onlardan zaman türetme. Bu yasaklı çünkü kullanıcı arayüzü zaman bilgisini ayrı bir alanda zaten gösteriyor; senin tekrarlaman çelişkili sonuçlara yol açıyor. Bunun yerine olaya değer + tip üzerinden atıfta bulun. ÖRNEK CÜMLE YAPISI (zaman içermeyen): "Kayıtlarınızda [lastValue] [birim] değerinde bir [hiperglisemi/hipoglisemi/hipertansif kriz] olayı yer alıyor. Ardından gelen [stableReadingsSince] normal aralıkta ölçüm toparlanmanın sağlandığını gösteriyor. İzlemenizi sürdürmenizi öneririz." doctorAdvice'ı bu durumda zorunlu yapma; HIGH risk ise standart "doktorunuzla görüşmenizi öneririz" yeterli. *_resolved sinyali aktif bir kritik durum DEĞİLDİR.
7. Notlardaki kişisel bilgileri (isim, adres) ASLA tekrar etme. Sadece sağlıkla ilgili bağlamı kullan.
8. Notlardaki belirsiz/anlamsız ifadeleri (örn. "asdasd") yok say.
9. Yanıt SADECE şu JSON şemasında olmalı:
{
  "summary": "2-4 cümlelik doğal dil özet. Mevcut durum + trend.",
  "recommendations": [
    { "title": "Kısa başlık", "detail": "1-2 cümle pratik öneri", "icon": "water | moon | barbell | nutrition | spa | walk | medical | pulse" }
  ],
  "doctorAdvice": "metin veya null"
}
10. recommendations en fazla 3 madde olsun, kullanıcı profili (yaş, BMI, sigara, aktivite, tuz tüketimi) ve varsa notlardaki bağlamla bağlantılı olsun.
11. Türkçe konuş, samimi ama profesyonel ton. Emoji kullanma.
12. ANALİZ PENCERESİ: deterministicAnalysis.windowDays alanı analizin kapsadığı gün sayısıdır (şu an 7). Eğer özetinde süreden bahsedeceksen sabit "30 gün", "1 ay" gibi rakamlar yazma — kaç gün olduğunu windowDays'ten oku ve "son 7 gün" gibi tutarlı kullan. Mümkünse spesifik sayı yerine "son haftanız", "son ölçümleriniz", "kayıtlarınız" gibi süre belirtmeyen ifadeleri tercih et; bu, pencere boyutu ileride değişirse bile metnin doğru kalmasını sağlar.`;

  // AI o anki tarihi güvenilir şekilde bilmediği ve narrative önbelleğe
  // alındığı için herhangi bir "X dk önce" ifadesi banner ile çelişebilir.
  // Çözüm: AI'a hiç zaman bilgisi (lastOccurredAt vb.) göstermiyoruz; banner
  // zamanı kendisi gösteriyor, AI sadece değer + bağlam üzerinden konuşacak.
  const sanitized = stripTimestampsForAI(deterministic);

  const userPrompt = JSON.stringify(
    {
      profile,
      deterministicAnalysis: sanitized,
      recentNotes,
    },
    null,
    2
  );

  const completion = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error('OpenAI boş cevap döndü');

  try {
    const parsed = JSON.parse(raw);
    return {
      summary: String(parsed.summary || ''),
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.slice(0, 3).map((r: any) => ({
            title: String(r.title || ''),
            detail: String(r.detail || ''),
            icon: r.icon ? String(r.icon) : undefined,
          }))
        : [],
      doctorAdvice: parsed.doctorAdvice ? String(parsed.doctorAdvice) : null,
    };
  } catch (e) {
    console.error('AI cevabı parse edilemedi:', raw);
    throw new Error('AI cevabı geçersiz JSON formatında');
  }
}

// AI özetini DB'ye yazarken, sonraki cache kararı için deterministic snapshot'ı da saklıyoruz.
// Format: JSON string { summary, snapshot: { trend, signals } }
function serializeAISummary(narrative: AINarrative): string {
  return JSON.stringify({ summary: narrative.summary, doctorAdvice: narrative.doctorAdvice });
}
function serializeRecommendations(narrative: AINarrative): string {
  return JSON.stringify(narrative.recommendations);
}

function parseStoredAI(aiSummary: string, recommendation: string): AINarrative {
  let summary = '';
  let doctorAdvice: string | null = null;
  try {
    const p = JSON.parse(aiSummary);
    summary = p.summary || '';
    doctorAdvice = p.doctorAdvice ?? null;
  } catch {
    summary = aiSummary;
  }
  let recs: AINarrative['recommendations'] = [];
  try {
    const parsed = JSON.parse(recommendation);
    if (Array.isArray(parsed)) recs = parsed;
  } catch {}
  return { summary, recommendations: recs, doctorAdvice };
}

/**
 * AI prompt'una gönderilecek deterministic analizden zaman damgalarını
 * çıkarır. Amaç: AI'ın "X dk önce" gibi banner ile çelişen ifadeler
 * üretmesini önlemek. Banner zamanı kendisi gösterir.
 */
function stripTimestampsForAI(d: DeterministicAnalysis): DeterministicAnalysis {
  const stripEvent = (e: any) => {
    if (!e) return null;
    const { lastOccurredAt: _ignored, ...rest } = e;
    return rest;
  };
  if (d.type === 'BLOOD_SUGAR') {
    return {
      ...d,
      criticalEvents: {
        severeHyperglycemia: stripEvent(d.criticalEvents.severeHyperglycemia),
        frequentHypo: stripEvent(d.criticalEvents.frequentHypo),
      },
    };
  }
  return {
    ...d,
    criticalEvents: {
      hypertensiveCrisis: stripEvent(d.criticalEvents.hypertensiveCrisis),
    },
  };
}

function deterministicScore(d: DeterministicAnalysis): number {
  // 0-100 ölçeğinde kaba bir sağlık skoru (yüksek = iyi)
  const riskWeights: Record<string, number> = {
    LOW: 90,
    MEDIUM: 65,
    HIGH: 40,
    CRITICAL: 15,
  };
  return riskWeights[d.riskLevel] ?? 50;
}
