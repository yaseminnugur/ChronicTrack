/**
 * Sağlık verisi validasyon kuralları
 * 
 * Medikal referanslar:
 * - Tansiyon (Sistolik/Diastolik): American Heart Association (AHA) Guidelines
 *   Sistolik: 40–300 mmHg (fizyolojik olarak mümkün aralık)
 *   Diastolik: 20–200 mmHg (fizyolojik olarak mümkün aralık)
 *   Normal aralık: 90-120 / 60-80 mmHg
 * 
 * - Kan Şekeri (Glikoz): American Diabetes Association (ADA) Standards of Care
 *   Glikoz: 20–600 mg/dL (fizyolojik olarak mümkün aralık)
 *   Normal açlık: 70-100 mg/dL
 * 
 * - Nabız: American Heart Association (AHA)
 *   Nabız: 20–300 BPM (fizyolojik olarak mümkün aralık)
 *   Normal dinlenme: 60-100 BPM
 * 
 * - HbA1c: American Diabetes Association (ADA) Standards of Care
 *   HbA1c: 3.0–20.0 % (ölçülebilir aralık)
 *   Normal: 4.0-5.6 %
 */

import { safeParseFloat, safeParseInt } from '../utils/numberUtils';

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

export type HealthField = keyof typeof HEALTH_RANGES;

// ── Validasyon sonuç tipi ───────────────────────────────────────────────────

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// ── Tek alan validasyonu ────────────────────────────────────────────────────

/**
 * Verilen sağlık alanı için değeri min/max aralığında doğrular.
 * @param field - Alan adı (systolic, diastolic, pulse, glucose, hba1c)
 * @param value - Doğrulanacak string değer
 * @param required - Alan zorunlu mu? (default: false)
 */
export const validateHealthField = (
  field: HealthField,
  value: string,
  required: boolean = false
): ValidationResult => {
  const range = HEALTH_RANGES[field];

  // Boş değer kontrolü
  if (!value || value.trim() === '') {
    if (required) {
      return { isValid: false, error: `${range.label} değeri zorunludur.` };
    }
    return { isValid: true }; // Zorunlu değilse boş geçilebilir
  }

  // Sayısal geçerlilik kontrolü
  const isDecimal = field === 'glucose' || field === 'hba1c';
  const numericValue = isDecimal ? safeParseFloat(value, NaN) : safeParseInt(value, NaN);

  if (isNaN(numericValue)) {
    return { isValid: false, error: `${range.label} için geçerli bir sayı giriniz.` };
  }

  // Min/max aralık kontrolü
  if (numericValue < range.min) {
    return {
      isValid: false,
      error: `${range.label} değeri en az ${range.min} ${range.unit} olmalıdır. (Ref: ${range.reference})`,
    };
  }

  if (numericValue > range.max) {
    return {
      isValid: false,
      error: `${range.label} değeri en fazla ${range.max} ${range.unit} olabilir. (Ref: ${range.reference})`,
    };
  }

  return { isValid: true };
};

// ── Tansiyon form validasyonu ───────────────────────────────────────────────

export interface BloodPressureValidation {
  isValid: boolean;
  errors: {
    systolic?: string;
    diastolic?: string;
    pulse?: string;
  };
}

export const validateBloodPressure = (
  systolic: string,
  diastolic: string,
  pulse: string
): BloodPressureValidation => {
  const errors: BloodPressureValidation['errors'] = {};

  const sisResult = validateHealthField('systolic', systolic, true);
  if (!sisResult.isValid) errors.systolic = sisResult.error;

  const diaResult = validateHealthField('diastolic', diastolic, true);
  if (!diaResult.isValid) errors.diastolic = diaResult.error;

  // Nabız opsiyonel
  if (pulse && pulse.trim() !== '') {
    const pulseResult = validateHealthField('pulse', pulse, false);
    if (!pulseResult.isValid) errors.pulse = pulseResult.error;
  }

  // Sistolik > Diastolik kontrolü (her iki değer de geçerliyse)
  if (!errors.systolic && !errors.diastolic && systolic && diastolic) {
    const sisVal = safeParseInt(systolic);
    const diaVal = safeParseInt(diastolic);
    if (sisVal <= diaVal) {
      errors.diastolic = 'Diastolik değer, sistolik değerden küçük olmalıdır.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ── Kan Şekeri form validasyonu ─────────────────────────────────────────────

export interface BloodSugarValidation {
  isValid: boolean;
  errors: {
    glucose?: string;
  };
}

export const validateBloodSugar = (glucose: string): BloodSugarValidation => {
  const errors: BloodSugarValidation['errors'] = {};

  const result = validateHealthField('glucose', glucose, true);
  if (!result.isValid) errors.glucose = result.error;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// ── HbA1c validasyonu ───────────────────────────────────────────────────────

export interface HbA1cValidation {
  isValid: boolean;
  errors: {
    hba1c?: string;
  };
}

export const validateHbA1c = (hba1c: string): HbA1cValidation => {
  const errors: HbA1cValidation['errors'] = {};

  if (hba1c && hba1c.trim() !== '') {
    const result = validateHealthField('hba1c', hba1c, false);
    if (!result.isValid) errors.hba1c = result.error;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
