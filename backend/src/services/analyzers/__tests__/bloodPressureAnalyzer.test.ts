import { describe, it, expect } from 'vitest';
import { analyzeBloodPressure } from '../bloodPressureAnalyzer.ts';
import type { UserProfileSummary } from '../types.ts';

const baseProfile: UserProfileSummary = {
  age: 45,
  weightKg: 75,
  heightCm: 175,
  bmi: 24.5,
  isSmoking: false,
  activityLevel: 'Orta',
  saltLevel: 'Normal',
  diabetesType: null,
  hba1c: null,
  chronicConditions: [],
};

// Helper: build a BP record N days before "now"
const daysAgo = (n: number, hours = 10): Date => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hours, 0, 0, 0);
  return d;
};

describe('analyzeBloodPressure', () => {
  it('returns LOW risk + normal classification for healthy readings', () => {
    const records = Array.from({ length: 5 }, (_, i) => ({
      systolic: 118,
      diastolic: 76,
      pulse: 70,
      measuredAt: daysAgo(i + 1),
    }));
    const result = analyzeBloodPressure(records, baseProfile);
    expect(result.riskLevel).toBe('LOW');
    expect(result.classification.dominantCategory).toBe('normal');
    expect(result.stats.count).toBe(5);
    expect(result.stats.avgSystolic).toBe(118);
  });

  it('classifies elevated when 120-129 / <80', () => {
    const records = Array.from({ length: 4 }, (_, i) => ({
      systolic: 125,
      diastolic: 78,
      pulse: 72,
      measuredAt: daysAgo(i + 1),
    }));
    const result = analyzeBloodPressure(records, baseProfile);
    expect(result.classification.dominantCategory).toBe('elevated');
    expect(result.riskLevel).toBe('MEDIUM');
  });

  it('classifies stage1 hypertension (130-139 / 80-89) as MEDIUM risk', () => {
    // Use afternoon hours (14:00) to avoid triggering morning_hypertension signal
    const records = Array.from({ length: 4 }, (_, i) => ({
      systolic: 132,
      diastolic: 82,
      pulse: 72,
      measuredAt: daysAgo(i + 1, 14),
    }));
    const result = analyzeBloodPressure(records, baseProfile);
    expect(result.classification.dominantCategory).toBe('stage1');
    expect(result.riskLevel).toBe('MEDIUM');
  });

  it('classifies stage2 hypertension as HIGH risk', () => {
    const records = Array.from({ length: 4 }, (_, i) => ({
      systolic: 150,
      diastolic: 95,
      pulse: 72,
      measuredAt: daysAgo(i + 1),
    }));
    const result = analyzeBloodPressure(records, baseProfile);
    expect(result.classification.dominantCategory).toBe('stage2');
    expect(result.riskLevel).toBe('HIGH');
  });

  it('flags hypertensive crisis as CRITICAL', () => {
    const records = [
      { systolic: 185, diastolic: 125, pulse: 90, measuredAt: daysAgo(1) },
      { systolic: 120, diastolic: 80, pulse: 70, measuredAt: daysAgo(2) },
      { systolic: 118, diastolic: 78, pulse: 70, measuredAt: daysAgo(3) },
    ];
    const result = analyzeBloodPressure(records, baseProfile);
    expect(result.classification.crisis).toBe(1);
    expect(result.signals).toContain('hypertensive_crisis');
    expect(result.riskLevel).toBe('CRITICAL');
  });

  it('detects morning hypertension when morning sys >= 135', () => {
    const records = [
      { systolic: 140, diastolic: 88, pulse: 80, measuredAt: daysAgo(1, 7) },
      { systolic: 138, diastolic: 86, pulse: 78, measuredAt: daysAgo(2, 8) },
      { systolic: 136, diastolic: 84, pulse: 76, measuredAt: daysAgo(3, 6) },
    ];
    const result = analyzeBloodPressure(records, baseProfile);
    expect(result.patterns.morningHypertension).toBe(true);
    expect(result.signals).toContain('morning_hypertension');
  });

  it('detects tachycardia when avg pulse > 100', () => {
    const records = Array.from({ length: 4 }, (_, i) => ({
      systolic: 118,
      diastolic: 78,
      pulse: 110,
      measuredAt: daysAgo(i + 1),
    }));
    const result = analyzeBloodPressure(records, baseProfile);
    expect(result.signals).toContain('tachycardia');
  });

  it('detects bradycardia when avg pulse < 50', () => {
    const records = Array.from({ length: 4 }, (_, i) => ({
      systolic: 118,
      diastolic: 78,
      pulse: 45,
      measuredAt: daysAgo(i + 1),
    }));
    const result = analyzeBloodPressure(records, baseProfile);
    expect(result.signals).toContain('bradycardia');
  });

  it('detects wide pulse pressure when avg sys-dia > 60', () => {
    const records = Array.from({ length: 4 }, (_, i) => ({
      systolic: 160,
      diastolic: 70,
      pulse: 75,
      measuredAt: daysAgo(i + 1),
    }));
    const result = analyzeBloodPressure(records, baseProfile);
    expect(result.stats.pulsePressureAvg).toBeGreaterThan(60);
    expect(result.signals).toContain('wide_pulse_pressure');
  });

  it('adds smoking_with_hypertension signal when smoker has elevated readings', () => {
    const smokerProfile: UserProfileSummary = { ...baseProfile, isSmoking: true };
    const records = Array.from({ length: 3 }, (_, i) => ({
      systolic: 128,
      diastolic: 78,
      pulse: 75,
      measuredAt: daysAgo(i + 1),
    }));
    const result = analyzeBloodPressure(records, smokerProfile);
    expect(result.signals).toContain('smoking_with_hypertension');
  });

  it('handles empty records gracefully', () => {
    const result = analyzeBloodPressure([], baseProfile);
    expect(result.recordsConsidered).toBe(0);
    expect(result.stats.count).toBe(0);
    expect(result.stats.avgSystolic).toBeNull();
    expect(result.riskLevel).toBe('LOW');
    expect(result.trend).toBe('INSUFFICIENT_DATA');
  });

  it('returns INSUFFICIENT_DATA trend when fewer than 3 records per window', () => {
    const records = [
      { systolic: 120, diastolic: 80, pulse: 70, measuredAt: daysAgo(1) },
      { systolic: 122, diastolic: 81, pulse: 71, measuredAt: daysAgo(2) },
    ];
    const result = analyzeBloodPressure(records, baseProfile);
    expect(result.trend).toBe('INSUFFICIENT_DATA');
  });

  it('detects WORSENING trend when current avg notably higher than previous', () => {
    const current = Array.from({ length: 5 }, (_, i) => ({
      systolic: 150,
      diastolic: 95,
      pulse: 80,
      measuredAt: daysAgo(i + 1),
    }));
    const previous = Array.from({ length: 5 }, (_, i) => ({
      systolic: 120,
      diastolic: 78,
      pulse: 72,
      measuredAt: daysAgo(35 + i),
    }));
    const result = analyzeBloodPressure([...current, ...previous], baseProfile);
    expect(result.trend).toBe('WORSENING');
    expect(result.trendDeltaPct).toBeGreaterThan(0);
  });

  it('detects IMPROVING trend when current avg lower than previous', () => {
    const current = Array.from({ length: 5 }, (_, i) => ({
      systolic: 118,
      diastolic: 76,
      pulse: 70,
      measuredAt: daysAgo(i + 1),
    }));
    const previous = Array.from({ length: 5 }, (_, i) => ({
      systolic: 145,
      diastolic: 92,
      pulse: 80,
      measuredAt: daysAgo(35 + i),
    }));
    const result = analyzeBloodPressure([...current, ...previous], baseProfile);
    expect(result.trend).toBe('IMPROVING');
    expect(result.trendDeltaPct).toBeLessThan(0);
  });

  it('only considers records within the window', () => {
    const records = [
      { systolic: 120, diastolic: 80, pulse: 70, measuredAt: daysAgo(2) },
      { systolic: 200, diastolic: 130, pulse: 100, measuredAt: daysAgo(60) }, // outside window
    ];
    const result = analyzeBloodPressure(records, baseProfile, 30);
    expect(result.recordsConsidered).toBe(1);
    expect(result.classification.crisis).toBe(0);
  });
});
