/**
 * Sayısal değer normalleştirme yardımcı fonksiyonları
 * Türkçe lokalizasyonda virgül (,) ondalık ayırıcı olarak kullanılır.
 * Bu modül, virgüllü girişlerin backend'de doğru şekilde işlenmesini sağlar.
 */

/**
 * Virgülü noktaya çevirir ve string değeri güvenli şekilde float'a dönüştürür.
 * Örnek: "7,5" -> 7.5, "120" -> 120, "" -> fallback
 */
export const safeParseFloat = (value: string | number | null | undefined, fallback: number = 0): number => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number') return value;
  const normalized = value.toString().trim().replace(/,/g, '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Virgülü noktaya çevirir ve string değeri güvenli şekilde integer'a dönüştürür.
 * Örnek: "120" -> 120, "7,5" -> 7, "" -> fallback
 */
export const safeParseInt = (value: string | number | null | undefined, fallback: number = 0): number => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number') return Math.round(value);
  const normalized = value.toString().trim().replace(/,/g, '.');
  const parsed = parseInt(normalized, 10);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Virgüllü bir değerin geçerli bir sayı olup olmadığını kontrol eder.
 * isNaN() yerine bu fonksiyonu kullanın.
 */
export const isValidNumber = (value: string | number | null | undefined): boolean => {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'number') return !isNaN(value);
  const normalized = value.toString().trim().replace(/,/g, '.');
  return !isNaN(parseFloat(normalized)) && isFinite(Number(normalized));
};
