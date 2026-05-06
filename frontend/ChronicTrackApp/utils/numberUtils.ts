/**
 * Sayısal giriş yardımcı fonksiyonları
 * Türkçe lokalizasyonda virgül (,) ondalık ayırıcı olarak kullanılır.
 * Bu modül, virgüllü girişlerin doğru şekilde işlenmesini sağlar.
 */

/**
 * Virgülü noktaya çevirir (Türkçe ondalık formatı -> JavaScript formatı)
 * Örnek: "7,5" -> "7.5"
 */
export const normalizeDecimalSeparator = (value: string): string => {
  return value.replace(/,/g, '.');
};

/**
 * Tam sayı girişi için filtre: sadece rakamlara izin verir.
 * Kullanım: Yaş, boy (cm), tansiyon değerleri gibi tam sayı alanları
 */
export const filterIntegerInput = (text: string): string => {
  return text.replace(/[^0-9]/g, '');
};

/**
 * Ondalıklı sayı girişi için filtre: rakamlara, noktaya ve virgüle izin verir.
 * Virgülü otomatik olarak noktaya çevirir.
 * Birden fazla ondalık ayırıcı girilmesini engeller.
 * Kullanım: Kilo, glikoz, HbA1c gibi ondalıklı sayı alanları
 */
export const filterDecimalInput = (text: string): string => {
  // Virgülü noktaya çevir
  let normalized = text.replace(/,/g, '.');
  // Sadece rakam ve noktaya izin ver
  normalized = normalized.replace(/[^0-9.]/g, '');
  // Birden fazla nokta varsa sadece ilkini koru
  const parts = normalized.split('.');
  if (parts.length > 2) {
    normalized = parts[0] + '.' + parts.slice(1).join('');
  }
  return normalized;
};

/**
 * String değeri güvenli bir şekilde sayıya çevirir.
 * Virgüllü değerleri de doğru şekilde işler.
 * Geçersiz değerler için fallback değeri döndürür.
 */
export const safeParseFloat = (value: string | number | null | undefined, fallback: number = 0): number => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number') return value;
  const normalized = normalizeDecimalSeparator(value.toString().trim());
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * String değeri güvenli bir şekilde tam sayıya çevirir.
 * Virgüllü değerleri de doğru şekilde işler.
 */
export const safeParseInt = (value: string | number | null | undefined, fallback: number = 0): number => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number') return Math.round(value);
  const normalized = normalizeDecimalSeparator(value.toString().trim());
  const parsed = parseInt(normalized, 10);
  return isNaN(parsed) ? fallback : parsed;
};
