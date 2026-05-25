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
  refreshReason?: 'no_previous' | 'risk_changed' | 'trend_changed' | 'signals_changed' | 'stale' | 'forced';
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

  const refreshDecision = decideRefresh(last, deterministic, !!options.force);

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
  // 2x window al ki trend için önceki periyodu hesaplayabilelim
  const windowDays = 30;
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

function decideRefresh(
  last: { createdAt: Date; status: string; aiSummary: string } | null,
  current: DeterministicAnalysis,
  forced: boolean
): { refresh: boolean; reason?: AnalysisResult['refreshReason'] } {
  if (forced) return { refresh: true, reason: 'forced' };
  if (!last) return { refresh: true, reason: 'no_previous' };

  const age = Date.now() - last.createdAt.getTime();
  if (age > STALE_MS) return { refresh: true, reason: 'stale' };

  // Risk seviyesi değişti mi?
  if (last.status !== current.riskLevel) return { refresh: true, reason: 'risk_changed' };

  // Eski narrative'den trend ve signals çek (serialize'da sakladık)
  const previousSnapshot = parseDeterministicSnapshot(last.aiSummary);
  if (previousSnapshot) {
    if (previousSnapshot.trend !== current.trend) return { refresh: true, reason: 'trend_changed' };
    if (signalsChanged(previousSnapshot.signals, current.signals))
      return { refresh: true, reason: 'signals_changed' };
  }

  return { refresh: false };
}

function signalsChanged(prev: string[], curr: string[]): boolean {
  if (prev.length !== curr.length) return true;
  const a = [...prev].sort();
  const b = [...curr].sort();
  return a.some((v, i) => v !== b[i]);
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
11. Türkçe konuş, samimi ama profesyonel ton. Emoji kullanma.`;

  const userPrompt = JSON.stringify(
    {
      profile,
      deterministicAnalysis: deterministic,
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

// Snapshot'ı aiSummary kolonunda saklamıyoruz çünkü orası kullanıcı metni.
// Cache kararı için deterministic'in bir snapshot'ını ayrı tutmak gerekirdi
// ama HealthAnalysis şemasında ek alan yok. Geçici çözüm: status (riskLevel) yeterli,
// trend/signals değişimi için yeniden hesaplama bunu yakalar.
function parseDeterministicSnapshot(_aiSummary: string): { trend: string; signals: string[] } | null {
  // Şu an snapshot saklamıyoruz; trend/signals değişimi için DB şeması genişletilmedi.
  // riskLevel değişimi + STALE_DAYS yeterli kapsama sağlar.
  return null;
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
