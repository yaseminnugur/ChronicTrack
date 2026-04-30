import * as z from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-posta adresi zorunludur')
    .email('Geçerli bir e-posta adresi giriniz'),
  password: z
    .string()
    .min(1, 'Şifre zorunludur')
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .regex(/[a-zçğıöşü]/, 'Şifre en az bir küçük harf içermelidir')
    .regex(/[A-ZÇĞİÖŞÜ]/, 'Şifre en az bir büyük harf içermelidir'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Ad Soyad zorunludur')
    .min(3, 'Ad Soyad en az 3 karakter olmalıdır'),
  email: z
    .string()
    .min(1, 'E-posta adresi zorunludur')
    .email('Geçerli bir e-posta adresi giriniz'),
  password: z
    .string()
    .min(1, 'Şifre zorunludur')
    .min(6, 'Şifre en az 6 karakter olmalıdır')
    .regex(/[a-zçğıöşü]/, 'Şifre en az bir küçük harf içermelidir')
    .regex(/[A-ZÇĞİÖŞÜ]/, 'Şifre en az bir büyük harf içermelidir'),
  passwordConfirm: z
    .string()
    .min(1, 'Şifre tekrarı zorunludur'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Şifreler eşleşmiyor",
  path: ["passwordConfirm"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
