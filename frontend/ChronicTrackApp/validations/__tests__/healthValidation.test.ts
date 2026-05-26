import { describe, it, expect } from 'vitest';
import {
  validateHealthField,
  validateBloodPressure,
  validateBloodSugar,
  validateHbA1c,
  MEAL_STATES,
} from '../healthValidation';

describe('frontend healthValidation', () => {
  describe('validateHealthField', () => {
    it('accepts empty when not required', () => {
      expect(validateHealthField('pulse', '').isValid).toBe(true);
      expect(validateHealthField('pulse', '   ').isValid).toBe(true);
    });

    it('rejects empty when required', () => {
      const result = validateHealthField('systolic', '', true);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('zorunludur');
    });

    it('rejects non-numeric input', () => {
      const result = validateHealthField('glucose', 'abc', true);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('geçerli bir sayı');
    });

    it('accepts TR comma decimal for glucose', () => {
      expect(validateHealthField('glucose', '120,5', true).isValid).toBe(true);
    });

    it('accepts TR comma decimal for hba1c', () => {
      expect(validateHealthField('hba1c', '5,7', false).isValid).toBe(true);
    });

    it('rejects values below the field min', () => {
      expect(validateHealthField('systolic', '39', true).isValid).toBe(false);
      expect(validateHealthField('glucose', '19', true).isValid).toBe(false);
      expect(validateHealthField('hba1c', '2,9', false).isValid).toBe(false);
    });

    it('rejects values above the field max', () => {
      expect(validateHealthField('systolic', '301', true).isValid).toBe(false);
      expect(validateHealthField('diastolic', '201', true).isValid).toBe(false);
      expect(validateHealthField('pulse', '301', false).isValid).toBe(false);
      expect(validateHealthField('glucose', '601', true).isValid).toBe(false);
      expect(validateHealthField('hba1c', '20,1', false).isValid).toBe(false);
    });

    it('accepts boundary values exactly at min/max', () => {
      expect(validateHealthField('systolic', '40', true).isValid).toBe(true);
      expect(validateHealthField('systolic', '300', true).isValid).toBe(true);
      expect(validateHealthField('hba1c', '3.0', false).isValid).toBe(true);
      expect(validateHealthField('hba1c', '20.0', false).isValid).toBe(true);
    });
  });

  describe('validateBloodPressure', () => {
    it('accepts a normal reading 120/80 (without pulse)', () => {
      const result = validateBloodPressure('120', '79', '');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('accepts a normal reading with pulse', () => {
      const result = validateBloodPressure('118', '76', '72');
      expect(result.isValid).toBe(true);
    });

    it('flags missing required fields individually', () => {
      const result = validateBloodPressure('', '', '');
      expect(result.isValid).toBe(false);
      expect(result.errors.systolic).toBeDefined();
      expect(result.errors.diastolic).toBeDefined();
    });

    it('rejects when systolic <= diastolic', () => {
      const result = validateBloodPressure('100', '100', '');
      expect(result.isValid).toBe(false);
      expect(result.errors.diastolic).toContain('sistolik');
    });

    it('validates pulse only when provided', () => {
      expect(validateBloodPressure('120', '80', '').isValid).toBe(true);
      expect(validateBloodPressure('120', '80', '350').isValid).toBe(false);
    });

    it('rejects values outside physiological range', () => {
      expect(validateBloodPressure('30', '20', '').isValid).toBe(false);
      expect(validateBloodPressure('310', '90', '').isValid).toBe(false);
    });
  });

  describe('validateBloodSugar', () => {
    it('accepts valid glucose with valid meal state', () => {
      const result = validateBloodSugar('110', 'Açlık');
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('requires glucose value', () => {
      const result = validateBloodSugar('', 'Açlık');
      expect(result.isValid).toBe(false);
      expect(result.errors.glucose).toBeDefined();
    });

    it('requires valid meal state from whitelist', () => {
      const result = validateBloodSugar('110', 'invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors.mealState).toBeDefined();
    });

    it('rejects missing meal state (null/undefined)', () => {
      expect(validateBloodSugar('110', null).isValid).toBe(false);
      expect(validateBloodSugar('110', undefined).isValid).toBe(false);
    });

    it('accepts all whitelisted meal states', () => {
      for (const state of MEAL_STATES) {
        expect(validateBloodSugar('110', state).isValid).toBe(true);
      }
    });

    it('rejects out-of-range glucose values', () => {
      expect(validateBloodSugar('19', 'Açlık').isValid).toBe(false);
      expect(validateBloodSugar('601', 'Açlık').isValid).toBe(false);
    });

    it('accepts comma decimal glucose', () => {
      expect(validateBloodSugar('120,5', 'Açlık').isValid).toBe(true);
    });
  });

  describe('validateHbA1c', () => {
    it('accepts empty (optional)', () => {
      expect(validateHbA1c('').isValid).toBe(true);
      expect(validateHbA1c('   ').isValid).toBe(true);
    });

    it('accepts valid HbA1c value', () => {
      expect(validateHbA1c('5,7').isValid).toBe(true);
      expect(validateHbA1c('7.2').isValid).toBe(true);
    });

    it('rejects out-of-range values', () => {
      expect(validateHbA1c('2,9').isValid).toBe(false);
      expect(validateHbA1c('21').isValid).toBe(false);
    });
  });
});
