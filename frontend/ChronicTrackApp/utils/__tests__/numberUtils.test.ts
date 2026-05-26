import { describe, it, expect } from 'vitest';
import {
  normalizeDecimalSeparator,
  filterIntegerInput,
  filterDecimalInput,
  safeParseFloat,
  safeParseInt,
} from '../numberUtils';

describe('frontend numberUtils', () => {
  describe('normalizeDecimalSeparator', () => {
    it('converts commas to dots', () => {
      expect(normalizeDecimalSeparator('7,5')).toBe('7.5');
      expect(normalizeDecimalSeparator('1,2,3')).toBe('1.2.3');
    });

    it('leaves dot-decimals unchanged', () => {
      expect(normalizeDecimalSeparator('7.5')).toBe('7.5');
    });
  });

  describe('filterIntegerInput', () => {
    it('strips non-digit characters', () => {
      expect(filterIntegerInput('12abc34')).toBe('1234');
      expect(filterIntegerInput('7,5')).toBe('75');
      expect(filterIntegerInput('7.5')).toBe('75');
      expect(filterIntegerInput('-12')).toBe('12');
    });

    it('handles empty input', () => {
      expect(filterIntegerInput('')).toBe('');
    });
  });

  describe('filterDecimalInput', () => {
    it('allows digits and converts commas to dots', () => {
      expect(filterDecimalInput('7,5')).toBe('7.5');
      expect(filterDecimalInput('12.3')).toBe('12.3');
    });

    it('strips letters and special chars', () => {
      expect(filterDecimalInput('7a.5b')).toBe('7.5');
    });

    it('keeps only the first decimal separator if multiple given', () => {
      expect(filterDecimalInput('7.5.3')).toBe('7.53');
      expect(filterDecimalInput('7,5,3')).toBe('7.53');
    });
  });

  describe('safeParseFloat', () => {
    it('parses TR-locale comma decimals', () => {
      expect(safeParseFloat('7,5')).toBe(7.5);
    });

    it('returns fallback for empty/null/invalid', () => {
      expect(safeParseFloat('')).toBe(0);
      expect(safeParseFloat(null)).toBe(0);
      expect(safeParseFloat('abc', -1)).toBe(-1);
    });

    it('accepts numeric input directly', () => {
      expect(safeParseFloat(42)).toBe(42);
    });
  });

  describe('safeParseInt', () => {
    it('parses integer strings, truncates decimals', () => {
      expect(safeParseInt('120')).toBe(120);
      expect(safeParseInt('7,5')).toBe(7);
    });

    it('rounds numeric inputs', () => {
      expect(safeParseInt(7.6)).toBe(8);
    });

    it('returns fallback for invalid input', () => {
      expect(safeParseInt('xyz', 99)).toBe(99);
    });
  });
});
