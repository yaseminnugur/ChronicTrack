import { describe, it, expect } from 'vitest';
import {
  getBloodSugarStatus,
  getBloodPressureStatus,
  getPulseStatus,
  getHbA1cStatus,
} from '../healthStatusUtils';

describe('healthStatusUtils', () => {
  describe('getBloodSugarStatus', () => {
    it('classifies hypoglycemia (<70) as low', () => {
      expect(getBloodSugarStatus(69).level).toBe('low');
      expect(getBloodSugarStatus(50).level).toBe('low');
      expect(getBloodSugarStatus(50).label).toBe('Düşük');
    });

    it('classifies 70–99 as normal', () => {
      expect(getBloodSugarStatus(70).level).toBe('normal');
      expect(getBloodSugarStatus(95).level).toBe('normal');
      expect(getBloodSugarStatus(99).level).toBe('normal');
    });

    it('classifies 100–125 as elevated (Yüksek Risk / prediabetes)', () => {
      expect(getBloodSugarStatus(100).level).toBe('elevated');
      expect(getBloodSugarStatus(125).level).toBe('elevated');
      expect(getBloodSugarStatus(110).label).toBe('Yüksek Risk');
    });

    it('classifies 126–250 as high', () => {
      expect(getBloodSugarStatus(126).level).toBe('high');
      expect(getBloodSugarStatus(200).level).toBe('high');
      expect(getBloodSugarStatus(250).level).toBe('high');
    });

    it('classifies >250 as critical', () => {
      expect(getBloodSugarStatus(251).level).toBe('critical');
      expect(getBloodSugarStatus(400).level).toBe('critical');
      expect(getBloodSugarStatus(400).label).toBe('Çok Yüksek');
      expect(getBloodSugarStatus(400).icon).toBe('alert-circle');
    });

    it('returns a color and bgColor for every level', () => {
      const s = getBloodSugarStatus(90);
      expect(s.color).toMatch(/^#[0-9A-F]{6}$/i);
      expect(s.bgColor).toMatch(/^#[0-9A-F]{6}$/i);
    });
  });

  describe('getBloodPressureStatus', () => {
    it('returns critical for crisis (>180 sys OR >120 dia)', () => {
      expect(getBloodPressureStatus(185, 90).level).toBe('critical');
      expect(getBloodPressureStatus(140, 125).level).toBe('critical');
      expect(getBloodPressureStatus(185, 90).label).toBe('Kriz');
    });

    it('returns high for stage 2 (>=140 sys OR >=90 dia)', () => {
      expect(getBloodPressureStatus(140, 88).level).toBe('high');
      expect(getBloodPressureStatus(125, 92).level).toBe('high');
    });

    it('returns elevated for stage 1 / borderline', () => {
      expect(getBloodPressureStatus(135, 78).level).toBe('elevated');
      expect(getBloodPressureStatus(120, 85).level).toBe('elevated');
    });

    it('returns low for hypotension (<90 sys OR <60 dia)', () => {
      expect(getBloodPressureStatus(85, 60).level).toBe('low');
      expect(getBloodPressureStatus(110, 55).level).toBe('low');
    });

    it('returns normal for healthy readings', () => {
      expect(getBloodPressureStatus(115, 75).level).toBe('normal');
      expect(getBloodPressureStatus(90, 60).level).toBe('normal');
    });

    it('handles boundary case sys=120 dia=80 as elevated (stage1)', () => {
      // sys=120, dia=80: dia>=80 triggers elevated branch
      expect(getBloodPressureStatus(120, 80).level).toBe('elevated');
    });
  });

  describe('getPulseStatus', () => {
    it('returns low (<60) for bradycardia', () => {
      expect(getPulseStatus(45).level).toBe('low');
      expect(getPulseStatus(59).level).toBe('low');
    });

    it('returns normal for 60–100', () => {
      expect(getPulseStatus(60).level).toBe('normal');
      expect(getPulseStatus(80).level).toBe('normal');
      expect(getPulseStatus(100).level).toBe('normal');
    });

    it('returns high (>100) for tachycardia', () => {
      expect(getPulseStatus(101).level).toBe('high');
      expect(getPulseStatus(130).level).toBe('high');
    });
  });

  describe('getHbA1cStatus', () => {
    it('classifies <5.7 as normal', () => {
      expect(getHbA1cStatus(5.0).level).toBe('normal');
      expect(getHbA1cStatus(5.6).level).toBe('normal');
    });

    it('classifies 5.7–6.4 as elevated (prediabetes)', () => {
      expect(getHbA1cStatus(5.7).level).toBe('elevated');
      expect(getHbA1cStatus(6.4).level).toBe('elevated');
      expect(getHbA1cStatus(6.0).label).toBe('Yüksek Risk');
    });

    it('classifies >=6.5 as high (diabetes)', () => {
      expect(getHbA1cStatus(6.5).level).toBe('high');
      expect(getHbA1cStatus(9.0).level).toBe('high');
    });
  });
});
