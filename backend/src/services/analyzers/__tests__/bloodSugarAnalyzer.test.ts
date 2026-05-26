import { describe, it, expect } from 'vitest';
import { analyzeBloodSugar } from '../bloodSugarAnalyzer.ts';
import type { UserProfileSummary } from '../types.ts';

const baseProfile: UserProfileSummary = {
  age: 50,
  weightKg: 80,
  heightCm: 170,
  bmi: 27.7,
  isSmoking: false,
  activityLevel: 'Düşük',
  saltLevel: 'Normal',
  diabetesType: 'Tip 2',
  hba1c: null,
  chronicConditions: [],
};

const daysAgo = (n: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

describe('analyzeBloodSugar', () => {
  it('returns LOW risk when no data and no HbA1c', () => {
    const result = analyzeBloodSugar([], baseProfile);
    expect(result.riskLevel).toBe('LOW');
    expect(result.recordsConsidered).toBe(0);
    expect(result.hasBaselineData).toBe(false);
    expect(result.hba1c).toBeNull();
  });

  it('uses HbA1c alone for baseline when no daily measurements', () => {
    const profile: UserProfileSummary = { ...baseProfile, hba1c: 8.2 };
    const result = analyzeBloodSugar([], profile);
    expect(result.hasBaselineData).toBe(true);
    expect(result.hba1c?.category).toBe('suboptimal');
    expect(result.riskLevel).toBe('HIGH');
    expect(result.signals).toContain('hba1c_only_baseline');
  });

  it('classifies HbA1c categories correctly', () => {
    expect(analyzeBloodSugar([], { ...baseProfile, hba1c: 5.4 }).hba1c?.category).toBe('normal');
    expect(analyzeBloodSugar([], { ...baseProfile, hba1c: 6.0 }).hba1c?.category).toBe('prediabetes');
    expect(analyzeBloodSugar([], { ...baseProfile, hba1c: 7.0 }).hba1c?.category).toBe('controlled');
    expect(analyzeBloodSugar([], { ...baseProfile, hba1c: 8.0 }).hba1c?.category).toBe('suboptimal');
    expect(analyzeBloodSugar([], { ...baseProfile, hba1c: 10.0 }).hba1c?.category).toBe('poor');
  });

  it('maps HbA1c category to risk level when no measurements', () => {
    expect(analyzeBloodSugar([], { ...baseProfile, hba1c: 5.4 }).riskLevel).toBe('LOW');
    expect(analyzeBloodSugar([], { ...baseProfile, hba1c: 6.0 }).riskLevel).toBe('MEDIUM');
    expect(analyzeBloodSugar([], { ...baseProfile, hba1c: 7.0 }).riskLevel).toBe('MEDIUM');
    expect(analyzeBloodSugar([], { ...baseProfile, hba1c: 8.0 }).riskLevel).toBe('HIGH');
    expect(analyzeBloodSugar([], { ...baseProfile, hba1c: 10.0 }).riskLevel).toBe('CRITICAL');
  });

  it('computes ADA eAG formula correctly (eAG = 28.7 * HbA1c - 46.7)', () => {
    const result = analyzeBloodSugar([], { ...baseProfile, hba1c: 7.0 });
    // 28.7 * 7 - 46.7 = 154.2
    expect(result.hba1c?.estimatedAvgGlucose).toBeCloseTo(154.2, 1);
  });

  it('flags severe_hyperglycemia (>250) as CRITICAL', () => {
    const records = [
      { glucose: 280, mealState: 'Yemek Sonrası', measuredAt: daysAgo(1) },
      { glucose: 150, mealState: 'Açlık', measuredAt: daysAgo(2) },
    ];
    const result = analyzeBloodSugar(records, baseProfile);
    expect(result.signals).toContain('severe_hyperglycemia');
    expect(result.riskLevel).toBe('CRITICAL');
  });

  it('flags frequent_hypo (>=2 readings <70) as CRITICAL', () => {
    const records = [
      { glucose: 60, mealState: 'Açlık', measuredAt: daysAgo(1) },
      { glucose: 55, mealState: 'Açlık', measuredAt: daysAgo(2) },
      { glucose: 90, mealState: 'Yemek Sonrası', measuredAt: daysAgo(3) },
    ];
    const result = analyzeBloodSugar(records, baseProfile);
    expect(result.stats.hypoCount).toBe(2);
    expect(result.signals).toContain('frequent_hypo');
    expect(result.riskLevel).toBe('CRITICAL');
  });

  it('detects post_meal_spike when post-fasting average exceeds fasting by >60', () => {
    const records = [
      { glucose: 95, mealState: 'Açlık', measuredAt: daysAgo(1) },
      { glucose: 100, mealState: 'Yemek Öncesi', measuredAt: daysAgo(2) },
      { glucose: 220, mealState: 'Yemek Sonrası', measuredAt: daysAgo(3) },
      { glucose: 200, mealState: 'Yemek Sonrası', measuredAt: daysAgo(4) },
    ];
    const result = analyzeBloodSugar(records, baseProfile);
    expect(result.patterns.postMealSpike).toBeGreaterThan(60);
    expect(result.signals).toContain('post_meal_spike');
  });

  it('detects low_time_in_range when <50% of readings in 70-180', () => {
    const records = [
      { glucose: 200, mealState: 'Yemek Sonrası', measuredAt: daysAgo(1) },
      { glucose: 210, mealState: 'Yemek Sonrası', measuredAt: daysAgo(2) },
      { glucose: 230, mealState: 'Yemek Sonrası', measuredAt: daysAgo(3) },
      { glucose: 90, mealState: 'Açlık', measuredAt: daysAgo(4) },
    ];
    const result = analyzeBloodSugar(records, baseProfile);
    expect(result.stats.inRangePct).toBeLessThan(50);
    expect(result.signals).toContain('low_time_in_range');
  });

  it('detects high_variability when stdDev > 50', () => {
    const records = [
      { glucose: 80, mealState: 'Açlık', measuredAt: daysAgo(1) },
      { glucose: 240, mealState: 'Yemek Sonrası', measuredAt: daysAgo(2) },
      { glucose: 70, mealState: 'Açlık', measuredAt: daysAgo(3) },
      { glucose: 220, mealState: 'Yemek Sonrası', measuredAt: daysAgo(4) },
    ];
    const result = analyzeBloodSugar(records, baseProfile);
    expect(result.stats.stdDev).toBeGreaterThan(50);
    expect(result.signals).toContain('high_variability');
  });

  it('flags hba1c_mismatch when measured avg deviates >25% from eAG', () => {
    // HbA1c=6.0 => eAG=125.5. Provide measurements with avg ~200 (~60% gap)
    const records = Array.from({ length: 6 }, (_, i) => ({
      glucose: 200,
      mealState: 'Yemek Sonrası',
      measuredAt: daysAgo(i + 1),
    }));
    const result = analyzeBloodSugar(records, { ...baseProfile, hba1c: 6.0 });
    expect(result.hba1cMismatch).not.toBeNull();
    expect(Math.abs(result.hba1cMismatch!.gapPct)).toBeGreaterThan(25);
    expect(result.signals).toContain('hba1c_mismatch');
  });

  it('returns LOW for healthy in-range readings', () => {
    const records = Array.from({ length: 5 }, (_, i) => ({
      glucose: 95,
      mealState: 'Açlık',
      measuredAt: daysAgo(i + 1),
    }));
    const result = analyzeBloodSugar(records, baseProfile);
    expect(result.signals).not.toContain('severe_hyperglycemia');
    expect(result.signals).not.toContain('frequent_hypo');
    expect(result.riskLevel).toBe('LOW');
  });

  it('computes stats min/max/avg correctly', () => {
    const records = [
      { glucose: 80, mealState: 'Açlık', measuredAt: daysAgo(1) },
      { glucose: 120, mealState: 'Yemek Sonrası', measuredAt: daysAgo(2) },
      { glucose: 160, mealState: 'Yemek Sonrası', measuredAt: daysAgo(3) },
    ];
    const result = analyzeBloodSugar(records, baseProfile);
    expect(result.stats.min).toBe(80);
    expect(result.stats.max).toBe(160);
    expect(result.stats.avg).toBe(120);
    expect(result.stats.count).toBe(3);
  });

  it('handles records outside window', () => {
    const records = [
      { glucose: 100, mealState: 'Açlık', measuredAt: daysAgo(2) },
      { glucose: 300, mealState: 'Yemek Sonrası', measuredAt: daysAgo(60) }, // outside
    ];
    const result = analyzeBloodSugar(records, baseProfile, 30);
    expect(result.recordsConsidered).toBe(1);
    expect(result.stats.max).toBe(100);
  });

  it('detects WORSENING trend when current avg rises >5%', () => {
    const current = Array.from({ length: 4 }, (_, i) => ({
      glucose: 200,
      mealState: 'Yemek Sonrası',
      measuredAt: daysAgo(i + 1),
    }));
    const previous = Array.from({ length: 4 }, (_, i) => ({
      glucose: 120,
      mealState: 'Yemek Sonrası',
      measuredAt: daysAgo(35 + i),
    }));
    const result = analyzeBloodSugar([...current, ...previous], baseProfile);
    expect(result.trend).toBe('WORSENING');
  });
});
