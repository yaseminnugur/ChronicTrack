import type {
  BloodSugarAnalysis,
  BloodSugarPatterns,
  BloodSugarStats,
  Hba1cAssessment,
  Hba1cCategory,
  RiskLevel,
  TrendDirection,
  UserProfileSummary,
} from './types.ts';

interface BloodSugarRecord {
  glucose: number;
  mealState: string;
  measuredAt: Date;
}

const DEFAULT_WINDOW_DAYS = 30;
const FASTING_STATES = ['Açlık', 'Yemek Öncesi', 'Uyku Öncesi'];
const POSTPRANDIAL_STATE = 'Yemek Sonrası';

export function analyzeBloodSugar(
  records: BloodSugarRecord[],
  profile: UserProfileSummary,
  windowDays: number = DEFAULT_WINDOW_DAYS
): BloodSugarAnalysis {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
  const previousStart = new Date(now.getTime() - 2 * windowDays * 24 * 60 * 60 * 1000);

  const current = records.filter((r) => r.measuredAt >= windowStart);
  const previous = records.filter((r) => r.measuredAt >= previousStart && r.measuredAt < windowStart);

  const stats = computeStats(current);
  const patterns = computePatterns(current);
  const trend = computeTrend(current, previous);
  const trendDeltaPct = computeTrendDelta(current, previous);

  const signals: string[] = [];
  if (stats.hypoCount >= 2) signals.push('frequent_hypo');
  if (patterns.postMealSpike != null && patterns.postMealSpike > 60) signals.push('post_meal_spike');
  if (stats.stdDev != null && stats.stdDev > 50) signals.push('high_variability');
  if (stats.severeHyperCount >= 1) signals.push('severe_hyperglycemia');
  if (stats.inRangePct != null && stats.inRangePct < 50) signals.push('low_time_in_range');

  // HbA1c değerlendirmesi (varsa)
  let hba1c: Hba1cAssessment | null = null;
  if (profile.hba1c != null) {
    hba1c = {
      value: profile.hba1c,
      category: classifyHba1c(profile.hba1c),
      // ADA formülü: eAG (mg/dL) = 28.7 × HbA1c - 46.7
      estimatedAvgGlucose: round(28.7 * profile.hba1c - 46.7)!,
    };
  }

  // HbA1c uyumu kontrolü (hem değer hem yeterli ölçüm varsa)
  let hba1cMismatch: BloodSugarAnalysis['hba1cMismatch'] = null;
  if (hba1c && stats.avg != null && stats.count >= 5) {
    const gapPct = ((stats.avg - hba1c.estimatedAvgGlucose) / hba1c.estimatedAvgGlucose) * 100;
    hba1cMismatch = {
      reportedHba1c: hba1c.value,
      estimatedFromAvg: hba1c.estimatedAvgGlucose,
      gapPct: round(gapPct)!,
    };
    if (Math.abs(gapPct) > 25) signals.push('hba1c_mismatch');
  }

  // Hiç günlük ölçüm yoksa ama HbA1c varsa, AI'ın bunu özetlemesi için işaretle
  if (current.length === 0 && hba1c) {
    signals.push('hba1c_only_baseline');
  }

  const hasBaselineData = current.length > 0 || hba1c != null;
  const riskLevel = computeRisk(stats, signals, hba1c);

  return {
    type: 'BLOOD_SUGAR',
    windowDays,
    recordsConsidered: current.length,
    hasBaselineData,
    riskLevel,
    trend,
    trendDeltaPct,
    stats,
    patterns,
    signals,
    hba1c,
    hba1cMismatch,
  };
}

function classifyHba1c(value: number): Hba1cCategory {
  if (value < 5.7) return 'normal';
  if (value < 6.5) return 'prediabetes';
  if (value <= 7.5) return 'controlled';
  if (value <= 9.0) return 'suboptimal';
  return 'poor';
}

function computeStats(records: BloodSugarRecord[]): BloodSugarStats {
  if (records.length === 0) {
    return {
      count: 0,
      avg: null,
      min: null,
      max: null,
      stdDev: null,
      inRangeCount: 0,
      hypoCount: 0,
      hyperCount: 0,
      severeHyperCount: 0,
      inRangePct: null,
    };
  }
  const values = records.map((r) => r.glucose);
  const avg = mean(values);
  const stdDev = std(values, avg);
  const inRangeCount = values.filter((v) => v >= 70 && v <= 180).length;
  const hypoCount = values.filter((v) => v < 70).length;
  const hyperCount = values.filter((v) => v > 180).length;
  const severeHyperCount = values.filter((v) => v > 250).length;
  return {
    count: records.length,
    avg: round(avg),
    min: round(Math.min(...values)),
    max: round(Math.max(...values)),
    stdDev: round(stdDev),
    inRangeCount,
    hypoCount,
    hyperCount,
    severeHyperCount,
    inRangePct: round((inRangeCount / records.length) * 100),
  };
}

function computePatterns(records: BloodSugarRecord[]): BloodSugarPatterns {
  const byMealState: BloodSugarPatterns['byMealState'] = {};
  const fastingValues: number[] = [];
  const postValues: number[] = [];

  for (const r of records) {
    const key = r.mealState || 'Belirtilmedi';
    if (!byMealState[key]) byMealState[key] = { count: 0, avg: null };
    byMealState[key].count += 1;
    // running avg
    const cur = byMealState[key];
    cur.avg = cur.avg == null ? r.glucose : (cur.avg * (cur.count - 1) + r.glucose) / cur.count;

    if (FASTING_STATES.includes(key)) fastingValues.push(r.glucose);
    if (key === POSTPRANDIAL_STATE) postValues.push(r.glucose);
  }
  for (const k of Object.keys(byMealState)) {
    byMealState[k].avg = round(byMealState[k].avg);
  }

  const averageFasting = fastingValues.length ? round(mean(fastingValues)) : null;
  const averagePostprandial = postValues.length ? round(mean(postValues)) : null;
  const postMealSpike =
    averageFasting != null && averagePostprandial != null
      ? round(averagePostprandial - averageFasting)
      : null;

  return { byMealState, averageFasting, averagePostprandial, postMealSpike };
}

function computeTrend(current: BloodSugarRecord[], previous: BloodSugarRecord[]): TrendDirection {
  if (current.length < 3 || previous.length < 3) return 'INSUFFICIENT_DATA';
  const curAvg = mean(current.map((r) => r.glucose));
  const prevAvg = mean(previous.map((r) => r.glucose));
  const deltaPct = ((curAvg - prevAvg) / prevAvg) * 100;
  // Glikoz için: yükseliş = kötüleşme
  if (Math.abs(deltaPct) < 5) return 'STABLE';
  return deltaPct > 0 ? 'WORSENING' : 'IMPROVING';
}

function computeTrendDelta(current: BloodSugarRecord[], previous: BloodSugarRecord[]): number | null {
  if (current.length === 0 || previous.length === 0) return null;
  const curAvg = mean(current.map((r) => r.glucose));
  const prevAvg = mean(previous.map((r) => r.glucose));
  return round(((curAvg - prevAvg) / prevAvg) * 100);
}

function computeRisk(
  stats: BloodSugarStats,
  signals: string[],
  hba1c: Hba1cAssessment | null
): RiskLevel {
  // Günlük ölçüm bazlı kritik sinyaller her zaman önceliklidir
  if (signals.includes('severe_hyperglycemia') || signals.includes('frequent_hypo')) return 'CRITICAL';

  // Hiç günlük ölçüm yoksa risk yalnızca HbA1c'den hesaplanır
  if (stats.count === 0) {
    if (!hba1c) return 'LOW';
    switch (hba1c.category) {
      case 'poor': return 'CRITICAL';
      case 'suboptimal': return 'HIGH';
      case 'controlled':
      case 'prediabetes': return 'MEDIUM';
      case 'normal': return 'LOW';
    }
  }

  // Hem günlük ölçüm hem (varsa) HbA1c'nin daha kötü olanını al
  let risk: RiskLevel = 'LOW';
  if (stats.avg != null && stats.avg > 180) risk = 'HIGH';
  if (signals.includes('low_time_in_range') || signals.includes('post_meal_spike')) risk = max(risk, 'HIGH');
  if (signals.includes('high_variability') || signals.includes('hba1c_mismatch')) risk = max(risk, 'MEDIUM');
  if (stats.avg != null && stats.avg > 140) risk = max(risk, 'MEDIUM');

  if (hba1c) {
    const hba1cRisk: RiskLevel =
      hba1c.category === 'poor' ? 'HIGH' :
      hba1c.category === 'suboptimal' ? 'HIGH' :
      hba1c.category === 'controlled' || hba1c.category === 'prediabetes' ? 'MEDIUM' :
      'LOW';
    risk = max(risk, hba1cRisk);
  }
  return risk;
}

const RISK_ORDER: Record<RiskLevel, number> = { LOW: 0, MEDIUM: 1, HIGH: 2, CRITICAL: 3 };
function max(a: RiskLevel, b: RiskLevel): RiskLevel {
  return RISK_ORDER[a] >= RISK_ORDER[b] ? a : b;
}

function mean(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}
function std(arr: number[], avg: number): number {
  if (arr.length <= 1) return 0;
  const variance = arr.reduce((s, v) => s + (v - avg) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}
function round(n: number): number;
function round(n: number | null): number | null;
function round(n: number | null): number | null {
  if (n == null) return null;
  return Math.round(n * 10) / 10;
}
