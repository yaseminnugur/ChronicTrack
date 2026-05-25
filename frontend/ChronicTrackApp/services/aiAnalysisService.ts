import { api } from './api';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TrendDirection = 'STABLE' | 'IMPROVING' | 'WORSENING' | 'INSUFFICIENT_DATA';
export type AnalysisType = 'BLOOD_SUGAR' | 'BLOOD_PRESSURE';

export interface AINarrative {
  summary: string;
  recommendations: Array<{ title: string; detail: string; icon?: string }>;
  doctorAdvice: string | null;
}

// Backend tarafından döndürülen analiz sonucu (şekil aynı, type aslında union)
export interface AnalysisResult {
  type: AnalysisType;
  generatedAt: string;
  fromCache: boolean;
  cacheReason?: 'unchanged' | 'no_data';
  refreshReason?: string;
  deterministic: any; // BloodSugarAnalysis | BloodPressureAnalysis (backend types)
  ai: AINarrative;
}

const pathMap = {
  BLOOD_SUGAR: 'blood-sugar',
  BLOOD_PRESSURE: 'blood-pressure',
} as const;

export const getAnalysis = async (type: AnalysisType): Promise<AnalysisResult> => {
  const res = await api.get(`/health/analysis/${pathMap[type]}`);
  return res.data;
};

export const refreshAnalysis = async (type: AnalysisType): Promise<AnalysisResult> => {
  const res = await api.post(`/health/analysis/${pathMap[type]}/refresh`);
  return res.data;
};
