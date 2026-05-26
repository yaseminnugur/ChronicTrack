import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../auth';

describe('auth zod schemas', () => {
  describe('loginSchema', () => {
    it('accepts a valid email + password', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'Strong1Pass',
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty email', () => {
      const result = loginSchema.safeParse({ email: '', password: 'Strong1' });
      expect(result.success).toBe(false);
    });

    it('rejects malformed email', () => {
      const result = loginSchema.safeParse({ email: 'not-email', password: 'Strong1' });
      expect(result.success).toBe(false);
    });

    it('rejects password without uppercase', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'allsmall1',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password without lowercase', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'ALLCAPS1',
      });
      expect(result.success).toBe(false);
    });

    it('rejects password shorter than 6 chars', () => {
      const result = loginSchema.safeParse({
        email: 'user@example.com',
        password: 'Ab1',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    const valid = {
      name: 'Ali Veli',
      email: 'ali@example.com',
      password: 'Strong1',
      passwordConfirm: 'Strong1',
    };

    it('accepts a valid registration', () => {
      expect(registerSchema.safeParse(valid).success).toBe(true);
    });

    it('rejects short name', () => {
      expect(registerSchema.safeParse({ ...valid, name: 'Al' }).success).toBe(false);
    });

    it('rejects mismatched password confirmation', () => {
      const result = registerSchema.safeParse({
        ...valid,
        passwordConfirm: 'Different1',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const mismatch = result.error.issues.find((i) => i.path.includes('passwordConfirm'));
        expect(mismatch?.message).toContain('eşleşmiyor');
      }
    });

    it('rejects empty name/email', () => {
      expect(registerSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
      expect(registerSchema.safeParse({ ...valid, email: '' }).success).toBe(false);
    });
  });
});
