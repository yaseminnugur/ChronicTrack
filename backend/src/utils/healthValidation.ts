/**
 * Backend sağlık verisi validasyon kuralları
 * 
 * Medikal referanslar:
 * - Tansiyon (Sistolik/Diastolik): American Heart Association (AHA) Guidelines
 *   Sistolik: 40–300 mmHg (fizyolojik olarak mümkün aralık)
 *   Diastolik: 20–200 mmHg (fizyolojik olarak mümkün aralık)
 * 
 * - Kan Şekeri (Glikoz): American Diabetes Association (ADA) Standards of Care
 *   Glikoz: 20–600 mg/dL (fizyolojik olarak mümkün aralık)
 * 
 * - Nabız: American Heart Association (AHA)
 *   Nabız: 20–300 BPM (fizyolojik olarak mümkün aralık)
 * 
 * - HbA1c: American Diabetes Association (ADA) Standards of Care
 *   HbA1c: 3.0–20.0 % (ölçülebilir aralık)
 */

import { safeParseFloat, safeParseInt, isValidNumber } from './numberUtils.ts';

// ── Değer aralıkları (min/max) ──────────────────────────────────────────────

export const HEALTH_RANGES = {
  systolic: {
    min: 40,
    max: 300,
    unit: 'mmHg',
    label: 'Sistolik tansiyon',
    reference: 'AHA Guidelines',
  },
  diastolic: {
    min: 20,
    max: 200,
    unit: 'mmHg',
    label: 'Diastolik tansiyon',
    reference: 'AHA Guidelines',
  },
  pulse: {
    min: 20,
    max: 300,
    unit: 'BPM',
    label: 'Nabız',
    reference: 'AHA Guidelines',
  },
  glucose: {
    min: 20,
    max: 600,
    unit: 'mg/dL',
    label: 'Kan şekeri (Glikoz)',
    reference: 'ADA Standards of Care',
  },
  hba1c: {
    min: 3.0,
    max: 20.0,
    unit: '%',
    label: 'HbA1c',
    reference: 'ADA Standards of Care',
  },
} as const;

type HealthField = keyof typeof HEALTH_RANGES;

// ── Validasyon sonuç tipi ───────────────────────────────────────────────────

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ── Tek alan validasyonu ────────────────────────────────────────────────────

const validateField = (
  field: HealthField,
  value: string | number | null | undefined,
  required: boolean = false
): ValidationError | null => {
  const range = HEALTH_RANGES[field];

  // Boş değer kontrolü
  if (value === null || value === undefined || value === '') {
    if (required) {
      return { field, message: `${range.label} değeri zorunludur.` };
    }
    return null;
  }

  // Sayısal geçerlilik kontrolü
  if (!isValidNumber(value)) {
    return { field, message: `${range.label} için geçerli bir sayı giriniz.` };
  }

  const isDecimal = field === 'glucose' || field === 'hba1c';
  const numericValue = isDecimal ? safeParseFloat(value) : safeParseInt(value);

  // Min/max aralık kontrolü
  if (numericValue < range.min) {
    return {
      field,
      message: `${range.label} değeri en az ${range.min} ${range.unit} olmalıdır. (Ref: ${range.reference})`,
    };
  }

  if (numericValue > range.max) {
    return {
      field,
      message: `${range.label} değeri en fazla ${range.max} ${range.unit} olabilir. (Ref: ${range.reference})`,
    };
  }

  return null;
};

// ── Tansiyon validasyonu ────────────────────────────────────────────────────

export const validateBloodPressureInput = (
  systolic: string | number | null | undefined,
  diastolic: string | number | null | undefined,
  pulse?: string | number | null | undefined
): ValidationResult => {
  const errors: ValidationError[] = [];

  const sisError = validateField('systolic', systolic, true);
  if (sisError) errors.push(sisError);

  const diaError = validateField('diastolic', diastolic, true);
  if (diaError) errors.push(diaError);

  // Nabız opsiyonel, ama verilmişse doğrula
  if (pulse !== null && pulse !== undefined && pulse !== '' && pulse !== '0' && pulse !== 0) {
    const pulseError = validateField('pulse', pulse, false);
    if (pulseError) errors.push(pulseError);
  }

  // Sistolik > Diastolik kontrolü (her iki değer de geçerliyse)
  if (!sisError && !diaError) {
    const sisVal = safeParseInt(systolic);
    const diaVal = safeParseInt(diastolic);
    if (sisVal <= diaVal) {
      errors.push({
        field: 'diastolic',
        message: 'Diastolik değer, sistolik değerden küçük olmalıdır.',
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ── Kan Şekeri validasyonu ──────────────────────────────────────────────────

export const validateBloodSugarInput = (
  glucose: string | number | null | undefined
): ValidationResult => {
  const errors: ValidationError[] = [];

  const error = validateField('glucose', glucose, true);
  if (error) errors.push(error);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ── HbA1c validasyonu ───────────────────────────────────────────────────────

export const validateHbA1cInput = (
  hba1c: string | number | null | undefined
): ValidationResult => {
  const errors: ValidationError[] = [];

  if (hba1c !== null && hba1c !== undefined && hba1c !== '') {
    const error = validateField('hba1c', hba1c, false);
    if (error) errors.push(error);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
