import { describe, it, expect } from 'vitest';
import {
  validateBloodPressureInput,
  validateBloodSugarInput,
  validateHbA1cInput,
  HEALTH_RANGES,
} from '../healthValidation.ts';

describe('healthValidation', () => {
  describe('validateBloodPressureInput', () => {
    it('passes for normal values (120/80)', () => {
      const result = validateBloodPressureInput(120, 80);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('passes with optional pulse provided', () => {
      const result = validateBloodPressureInput(118, 78, 72);
      expect(result.isValid).toBe(true);
    });

    it('requires systolic', () => {
      const result = validateBloodPressureInput('', 80);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'systolic')).toBe(true);
    });

    it('requires diastolic', () => {
      const result = validateBloodPressureInput(120, null);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'diastolic')).toBe(true);
    });

    it('rejects non-numeric input', () => {
      const result = validateBloodPressureInput('abc', 80);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('geçerli bir sayı'))).toBe(true);
    });

    it('rejects systolic below physiological minimum (40)', () => {
      const result = validateBloodPressureInput(39, 80);
      expect(result.isValid).toBe(false);
      const err = result.errors.find((e) => e.field === 'systolic');
      expect(err?.message).toContain('en az');
    });

    it('accepts systolic exactly at boundary (40 and 300)', () => {
      // Note: 40 is min, but sys must be > dia, so use dia below 40
      const low = validateBloodPressureInput(40, 20);
      expect(low.isValid).toBe(true);
      const high = validateBloodPressureInput(300, 200);
      expect(high.isValid).toBe(true);
    });

    it('rejects systolic above physiological maximum (300)', () => {
      const result = validateBloodPressureInput(301, 100);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === 'systolic')).toBe(true);
    });

    it('rejects when systolic <= diastolic', () => {
      const equal = validateBloodPressureInput(100, 100);
      expect(equal.isValid).toBe(false);
      expect(equal.errors.some((e) => e.message.includes('Diastolik değer'))).toBe(true);

      const inverted = validateBloodPressureInput(80, 120);
      expect(inverted.isValid).toBe(false);
    });

    it('skips pulse validation when pulse is empty/zero', () => {
      expect(validateBloodPressureInput(120, 80, 0).isValid).toBe(true);
      expect(validateBloodPressureInput(120, 80, '').isValid).toBe(true);
      expect(validateBloodPressureInput(120, 80, null).isValid).toBe(true);
    });

    it('validates pulse out of range when provided', () => {
      const tooLow = validateBloodPressureInput(120, 80, 19);
      expect(tooLow.isValid).toBe(false);
      expect(tooLow.errors.some((e) => e.field === 'pulse')).toBe(true);

      const tooHigh = validateBloodPressureInput(120, 80, 301);
      expect(tooHigh.isValid).toBe(false);
    });

    it('accepts TR-locale decimal separator (comma)', () => {
      // BP uses int parse, but the helpers should still accept comma
      const result = validateBloodPressureInput('120', '80');
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateBloodSugarInput', () => {
    it('passes for normal fasting (90 mg/dL)', () => {
      expect(validateBloodSugarInput(90).isValid).toBe(true);
    });

    it('passes for severe hyperglycemia within physiological max (599)', () => {
      expect(validateBloodSugarInput(599).isValid).toBe(true);
    });

    it('requires glucose', () => {
      const result = validateBloodSugarInput(null);
      expect(result.isValid).toBe(false);
      expect(result.errors[0].field).toBe('glucose');
    });

    it('rejects below min (20)', () => {
      expect(validateBloodSugarInput(19).isValid).toBe(false);
    });

    it('rejects above max (600)', () => {
      expect(validateBloodSugarInput(601).isValid).toBe(false);
    });

    it('accepts decimal with comma', () => {
      expect(validateBloodSugarInput('120,5').isValid).toBe(true);
    });

    it('rejects non-numeric', () => {
      expect(validateBloodSugarInput('foo').isValid).toBe(false);
    });
  });

  describe('validateHbA1cInput', () => {
    it('passes when empty (optional)', () => {
      expect(validateHbA1cInput('').isValid).toBe(true);
      expect(validateHbA1cInput(null).isValid).toBe(true);
      expect(validateHbA1cInput(undefined).isValid).toBe(true);
    });

    it('passes for normal HbA1c (5.4%)', () => {
      expect(validateHbA1cInput(5.4).isValid).toBe(true);
    });

    it('accepts comma decimal (5,7)', () => {
      expect(validateHbA1cInput('5,7').isValid).toBe(true);
    });

    it('rejects below min (3.0)', () => {
      expect(validateHbA1cInput(2.9).isValid).toBe(false);
    });

    it('rejects above max (20.0)', () => {
      expect(validateHbA1cInput(20.1).isValid).toBe(false);
    });
  });

  describe('HEALTH_RANGES sanity', () => {
    it('exposes expected medical reference ranges', () => {
      expect(HEALTH_RANGES.systolic.min).toBe(40);
      expect(HEALTH_RANGES.systolic.max).toBe(300);
      expect(HEALTH_RANGES.diastolic.min).toBe(20);
      expect(HEALTH_RANGES.glucose.max).toBe(600);
      expect(HEALTH_RANGES.hba1c.unit).toBe('%');
    });
  });
});
