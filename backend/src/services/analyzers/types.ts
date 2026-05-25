/**
 * Deterministic analyzer çıktıları. AI içermez — saf hesaplama.
 * AI orchestrator bu çıktıyı doğal dile çevirmesi için OpenAI'a gönderir.
 */

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TrendDirection = 'STABLE' | 'IMPROVING' | 'WORSENING' | 'INSUFFICIENT_DATA';
export type AnalysisType = 'BLOOD_SUGAR' | 'BLOOD_PRESSURE';

export interface UserProfileSummary {
  age?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;
  bmi?: number | null;
  isSmoking: boolean;
  activityLevel?: string | null;
  saltLevel?: string | null;
  diabetesType?: string | null;
  hba1c?: number | null;
  chronicConditions: string[];
}

export interface BloodSugarStats {
  count: number;
  avg: number | null;
  min: number | null;
  max: number | null;
  stdDev: number | null;
  inRangeCount: number;       // 70-180 mg/dL
  hypoCount: number;          // < 70
  hyperCount: number;         // > 180
  severeHyperCount: number;   // > 250
  inRangePct: number | null;  // 0-100
}

export interface BloodSugarPatterns {
  byMealState: Record<string, { count: number; avg: number | null }>;
  averageFasting: number | null;       // Açlık + Yemek Öncesi
  averagePostprandial: number | null;  // Yemek Sonrası
  postMealSpike: number | null;        // post - pre (varsa)
}

export type Hba1cCategory =
  | 'normal'        // < 5.7
  | 'prediabetes'   // 5.7 - 6.4
  | 'controlled'    // 6.5 - 7.5 (diyabet ama hedefte)
  | 'suboptimal'    // 7.6 - 9.0
  | 'poor';         // > 9.0

export interface Hba1cAssessment {
  value: number;
  category: Hba1cCategory;
  estimatedAvgGlucose: number;  // ADA eAG formülü (mg/dL)
}

export interface BloodSugarAnalysis {
  type: 'BLOOD_SUGAR';
  windowDays: number;
  recordsConsidered: number;
  hasBaselineData: boolean;       // recordsConsidered > 0 VEYA HbA1c mevcut → analiz değerlendirilebilir
  riskLevel: RiskLevel;
  trend: TrendDirection;
  trendDeltaPct: number | null;   // önceki dönemle karşılaştırma yüzdesi
  stats: BloodSugarStats;
  patterns: BloodSugarPatterns;
  signals: string[];              // 'frequent_hypo' | 'post_meal_spike' | 'high_variability' | 'severe_hyperglycemia' | 'hba1c_mismatch' | 'hba1c_only_baseline' | vb.
  hba1c: Hba1cAssessment | null;  // HbA1c değeri varsa sınıflandırması
  hba1cMismatch: { reportedHba1c: number; estimatedFromAvg: number; gapPct: number } | null;
}

export interface BloodPressureStats {
  count: number;
  avgSystolic: number | null;
  avgDiastolic: number | null;
  avgPulse: number | null;
  pulsePressureAvg: number | null; // sys - dia
}

export interface BPClassification {
  normal: number;
  elevated: number;     // Sis 120-129 / Dia <80
  stage1: number;       // 130-139 / 80-89
  stage2: number;       // ≥140 / ≥90
  crisis: number;       // ≥180 / ≥120
  dominantCategory: 'normal' | 'elevated' | 'stage1' | 'stage2' | 'crisis';
  dominantPct: number;  // 0-100
}

export interface BloodPressurePatterns {
  morning: { count: number; avgSys: number | null; avgDia: number | null };  // 05:00-11:00
  evening: { count: number; avgSys: number | null; avgDia: number | null };  // 18:00-23:59
  morningHypertension: boolean;
}

export interface BloodPressureAnalysis {
  type: 'BLOOD_PRESSURE';
  windowDays: number;
  recordsConsidered: number;
  riskLevel: RiskLevel;
  trend: TrendDirection;
  trendDeltaPct: number | null;
  stats: BloodPressureStats;
  classification: BPClassification;
  patterns: BloodPressurePatterns;
  signals: string[];   // 'morning_hypertension' | 'wide_pulse_pressure' | 'tachycardia' | 'bradycardia' | 'hypertensive_crisis' | vb.
}

export type DeterministicAnalysis = BloodSugarAnalysis | BloodPressureAnalysis;
