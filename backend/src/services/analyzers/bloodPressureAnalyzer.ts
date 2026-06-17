import type {
  BloodPressureAnalysis,
  BloodPressureCriticalEvents,
  BloodPressurePatterns,
  BloodPressureStats,
  BPClassification,
  ResolvedCriticalEvent,
  RiskLevel,
  TrendDirection,
  UserProfileSummary,
} from './types.ts';

interface BloodPressureRecord {
  systolic: number;
  diastolic: number;
  pulse: number;
  measuredAt: Date;
}

// Analiz penceresi: kullanıcının son durumunu doğru yansıtması için 7 gün.
// Trend için (önceki periyot) 7 gün daha geri bakılır → toplam 14 günlük veri ihtiyacı.
const DEFAULT_WINDOW_DAYS = 7;
const CRISIS_SYS = 180;
const CRISIS_DIA = 120;
// Hipertansif kriz sonrası "toparlandı" sayılması için ardışık olarak gelmesi
// gereken stage2/crisis OLMAYAN ölçüm sayısı (yani <140 sys ve <90 dia).
const STABLE_READINGS_REQUIRED = 3;

export function analyzeBloodPressure(
  records: BloodPressureRecord[],
  profile: UserProfileSummary,
  windowDays: number = DEFAULT_WINDOW_DAYS
): BloodPressureAnalysis {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  const previousStart = new Date(now.getTime() - 2 * windowDays * 24 * 60 * 60 * 1000);

  const current = records.filter((r) => r.measuredAt >= windowStart);
  const previous = records.filter((r) => r.measuredAt >= previousStart && r.measuredAt < windowStart);

  const stats = computeStats(current);
  const classification = computeClassification(current);
  const patterns = computePatterns(current);
  const trend = computeTrend(current, previous);
  const trendDeltaPct = computeTrendDelta(current, previous);

  const criticalEvents = computeCriticalEvents(current);

  const signals: string[] = [];
  if (patterns.morningHypertension) signals.push('morning_hypertension');
  if (stats.pulsePressureAvg != null && stats.pulsePressureAvg > 60) signals.push('wide_pulse_pressure');
  if (stats.avgPulse != null && stats.avgPulse > 100) signals.push('tachycardia');
  if (stats.avgPulse != null && stats.avgPulse < 50) signals.push('bradycardia');
  if (criticalEvents.hypertensiveCrisis) {
    signals.push(
      criticalEvents.hypertensiveCrisis.resolved
        ? 'hypertensive_crisis_resolved'
        : 'hypertensive_crisis'
    );
  }
  if (profile.isSmoking && classification.dominantCategory !== 'normal') signals.push('smoking_with_hypertension');
  if (profile.saltLevel === 'Yüksek' && classification.dominantCategory !== 'normal') signals.push('high_salt_with_hypertension');

  const riskLevel = computeRisk(classification, signals);

  return {
    type: 'BLOOD_PRESSURE',
    windowDays,
    recordsConsidered: current.length,
    riskLevel,
    trend,
    trendDeltaPct,
    stats,
    classification,
    patterns,
    signals,
    criticalEvents,
  };
}

/**
 * Pencerede yaşanan hipertansif kriz olaylarını "anlık" veya "toparlanmış"
 * olarak sınıflandırır. En son krizden sonra STABLE_READINGS_REQUIRED kadar
 * ardışık stage2/crisis OLMAYAN ölçüm geldiyse olay resolved sayılır.
 */
function computeCriticalEvents(records: BloodPressureRecord[]): BloodPressureCriticalEvents {
  const asc = [...records].sort((a, b) => a.measuredAt.getTime() - b.measuredAt.getTime());
  const crisisIndices: number[] = [];
  asc.forEach((r, i) => {
    if (r.systolic >= CRISIS_SYS || r.diastolic >= CRISIS_DIA) crisisIndices.push(i);
  });
  if (crisisIndices.length === 0) {
    return { hypertensiveCrisis: null };
  }
  const lastIdx = crisisIndices[crisisIndices.length - 1];
  const last = asc[lastIdx];
  let stableSince = 0;
  for (let i = lastIdx + 1; i < asc.length; i++) {
    const r = asc[i];
    // "Stabil" = ne stage2 ne crisis (sys < 140 ve dia < 90)
    if (r.systolic < 140 && r.diastolic < 90) stableSince++;
    else break;
  }
  const event: ResolvedCriticalEvent = {
    count: crisisIndices.length,
    lastValue: last.systolic, // gösterim için sistolik değeri saklıyoruz
    lastOccurredAt: last.measuredAt.toISOString(),
    resolved: stableSince >= STABLE_READINGS_REQUIRED,
    stableReadingsSince: stableSince,
  };
  return { hypertensiveCrisis: event };
}

function computeStats(records: BloodPressureRecord[]): BloodPressureStats {
  if (records.length === 0) {
    return {
      count: 0,
      avgSystolic: null,
      avgDiastolic: null,
      avgPulse: null,
      pulsePressureAvg: null,
    };
  }
  const sys = records.map((r) => r.systolic);
  const dia = records.map((r) => r.diastolic);
  const pulse = records.map((r) => r.pulse).filter((p) => p > 0);
  const avgSys = mean(sys);
  const avgDia = mean(dia);
  return {
    count: records.length,
    avgSystolic: round(avgSys),
    avgDiastolic: round(avgDia),
    avgPulse: pulse.length ? round(mean(pulse)) : null,
    pulsePressureAvg: round(avgSys - avgDia),
  };
}

function computeClassification(records: BloodPressureRecord[]): BPClassification {
  const buckets = { normal: 0, elevated: 0, stage1: 0, stage2: 0, crisis: 0 };
  for (const r of records) {
    const cat = classify(r.systolic, r.diastolic);
    buckets[cat] += 1;
  }
  const total = records.length || 1;
  const entries = Object.entries(buckets) as [keyof typeof buckets, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const dominant = entries[0];
  return {
    ...buckets,
    dominantCategory: records.length === 0 ? 'normal' : dominant[0],
    dominantPct: records.length === 0 ? 0 : round((dominant[1] / total) * 100)!,
  };
}

function classify(sys: number, dia: number): keyof Omit<BPClassification, 'dominantCategory' | 'dominantPct'> {
  if (sys >= 180 || dia >= 120) return 'crisis';
  if (sys >= 140 || dia >= 90) return 'stage2';
  if (sys >= 130 || dia >= 80) return 'stage1';
  if (sys >= 120) return 'elevated';
  return 'normal';
}

function computePatterns(records: BloodPressureRecord[]): BloodPressurePatterns {
  const morning = records.filter((r) => {
    const h = r.measuredAt.getHours();
    return h >= 5 && h < 11;
  });
  const evening = records.filter((r) => {
    const h = r.measuredAt.getHours();
    return h >= 18 && h <= 23;
  });

  const morningAvgSys = morning.length ? round(mean(morning.map((r) => r.systolic))) : null;
  const morningAvgDia = morning.length ? round(mean(morning.map((r) => r.diastolic))) : null;
  const eveningAvgSys = evening.length ? round(mean(evening.map((r) => r.systolic))) : null;
  const eveningAvgDia = evening.length ? round(mean(evening.map((r) => r.diastolic))) : null;

  // Morning hypertension: sabah sys ortalaması, akşam ortalamasından 10+ mmHg yüksekse
  // VEYA sabah sys >= 135 (ev BP eşiği)
  let morningHypertension = false;
  if (morning.length >= 3 && morningAvgSys != null) {
    if (morningAvgSys >= 135) morningHypertension = true;
    if (eveningAvgSys != null && morningAvgSys - eveningAvgSys >= 10) morningHypertension = true;
  }

  return {
    morning: { count: morning.length, avgSys: morningAvgSys, avgDia: morningAvgDia },
    evening: { count: evening.length, avgSys: eveningAvgSys, avgDia: eveningAvgDia },
    morningHypertension,
  };
}

function computeTrend(current: BloodPressureRecord[], previous: BloodPressureRecord[]): TrendDirection {
  if (current.length < 3 || previous.length < 3) return 'INSUFFICIENT_DATA';
  const curAvg = mean(current.map((r) => r.systolic));
  const prevAvg = mean(previous.map((r) => r.systolic));
  const deltaPct = ((curAvg - prevAvg) / prevAvg) * 100;
  if (Math.abs(deltaPct) < 3) return 'STABLE';
  return deltaPct > 0 ? 'WORSENING' : 'IMPROVING';
}

function computeTrendDelta(current: BloodPressureRecord[], previous: BloodPressureRecord[]): number | null {
  if (current.length === 0 || previous.length === 0) return null;
  const curAvg = mean(current.map((r) => r.systolic));
  const prevAvg = mean(previous.map((r) => r.systolic));
  return round(((curAvg - prevAvg) / prevAvg) * 100);
}

function computeRisk(classification: BPClassification, signals: string[]): RiskLevel {
  // Aktif (henüz toparlanmamış) kriz CRITICAL'ı tetikler
  if (signals.includes('hypertensive_crisis')) return 'CRITICAL';

  let risk: RiskLevel = 'LOW';
  if (classification.dominantCategory === 'stage2' || classification.stage2 > 0) risk = 'HIGH';
  if (signals.includes('morning_hypertension') || signals.includes('wide_pulse_pressure')) risk = max(risk, 'HIGH');
  if (classification.dominantCategory === 'stage1') risk = max(risk, 'MEDIUM');
  if (signals.includes('smoking_with_hypertension') || signals.includes('high_salt_with_hypertension'))
    risk = max(risk, 'MEDIUM');
  if (classification.dominantCategory === 'elevated') risk = max(risk, 'MEDIUM');

  // Toparlanmış kriz tamamen göz ardı edilmemeli — risk en az HIGH kalır.
  if (signals.includes('hypertensive_crisis_resolved')) risk = max(risk, 'HIGH');

  return risk;
}

const RISK_ORDER: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
function max(a: RiskLevel, b: RiskLevel): RiskLevel {
  return RISK_ORDER[a] >= RISK_ORDER[b] ? a : b;
}

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}
function round(n: number): number;
function round(n: number | null): number | null;
function round(n: number | null): number | null {
  if (n == null) return null;
  return Math.round(n * 10) / 10;
}
