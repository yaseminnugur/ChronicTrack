import { describe, it, expect } from 'vitest';
import { safeParseFloat, safeParseInt, isValidNumber } from '../numberUtils.ts';

describe('numberUtils', () => {
  describe('safeParseFloat', () => {
    it('parses plain numeric strings', () => {
      expect(safeParseFloat('120')).toBe(120);
      expect(safeParseFloat('7.5')).toBe(7.5);
    });

    it('treats comma as decimal separator (TR locale)', () => {
      expect(safeParseFloat('7,5')).toBe(7.5);
      expect(safeParseFloat('12,34')).toBe(12.34);
    });

    it('trims whitespace before parsing', () => {
      expect(safeParseFloat('  9,1  ')).toBe(9.1);
    });

    it('returns numbers as-is', () => {
      expect(safeParseFloat(42)).toBe(42);
      expect(safeParseFloat(0)).toBe(0);
    });

    it('returns fallback for null/undefined/empty', () => {
      expect(safeParseFloat(null)).toBe(0);
      expect(safeParseFloat(undefined)).toBe(0);
      expect(safeParseFloat('')).toBe(0);
      expect(safeParseFloat(null, -1)).toBe(-1);
    });

    it('returns fallback for non-numeric input', () => {
      expect(safeParseFloat('abc')).toBe(0);
      expect(safeParseFloat('abc', 99)).toBe(99);
    });
  });

  describe('safeParseInt', () => {
    it('parses integer strings', () => {
      expect(safeParseInt('120')).toBe(120);
    });

    it('truncates decimals via parseInt', () => {
      expect(safeParseInt('7,5')).toBe(7);
      expect(safeParseInt('9.9')).toBe(9);
    });

    it('rounds numeric inputs', () => {
      expect(safeParseInt(7.4)).toBe(7);
      expect(safeParseInt(7.6)).toBe(8);
    });

    it('returns fallback for empty/invalid input', () => {
      expect(safeParseInt(null)).toBe(0);
      expect(safeParseInt('xyz', 42)).toBe(42);
    });
  });

  describe('isValidNumber', () => {
    it('accepts integers and decimals (with comma or dot)', () => {
      expect(isValidNumber('120')).toBe(true);
      expect(isValidNumber('7.5')).toBe(true);
      expect(isValidNumber('7,5')).toBe(true);
      expect(isValidNumber(42)).toBe(true);
    });

    it('rejects empty/null/undefined', () => {
      expect(isValidNumber('')).toBe(false);
      expect(isValidNumber(null)).toBe(false);
      expect(isValidNumber(undefined)).toBe(false);
    });

    it('rejects non-numeric strings', () => {
      expect(isValidNumber('abc')).toBe(false);
      expect(isValidNumber('12abc')).toBe(false);
    });
  });
});
