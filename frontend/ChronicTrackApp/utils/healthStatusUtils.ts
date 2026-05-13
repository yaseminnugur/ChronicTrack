/**
 * Sağlık durumu sınıflandırma yardımcı fonksiyonları
 * 
 * Medikal Referanslar:
 * 
 * KAN ŞEKERİ (Glikoz) — American Diabetes Association (ADA) Standards of Care:
 *   - Düşük (Hipoglisemi): < 70 mg/dL
 *   - Normal: 70–99 mg/dL (açlık)
 *   - Yüksek Risk (Pre-diyabet): 100–125 mg/dL (açlık)
 *   - Yüksek (Diyabet): ≥ 126 mg/dL (açlık) / > 140 mg/dL (tokluk)
 *   - Çok Yüksek: > 250 mg/dL
 * 
 * TANSİYON — American Heart Association (AHA) Guidelines:
 *   - Düşük (Hipotansiyon): Sistolik < 90 veya Diastolik < 60
 *   - Normal: Sistolik < 120 ve Diastolik < 80
 *   - Yüksek Normal (Evre Öncesi): Sistolik 120-129 ve Diastolik < 80
 *   - Hafif Yüksek (Evre 1 HT): Sistolik 130-139 veya Diastolik 80-89
 *   - Yüksek (Evre 2 HT): Sistolik ≥ 140 veya Diastolik ≥ 90
 *   - Kriz: Sistolik > 180 veya Diastolik > 120
 * 
 * NABIZ — American Heart Association (AHA):
 *   - Düşük (Bradikardi): < 60 BPM
 *   - Normal: 60–100 BPM
 *   - Yüksek (Taşikardi): > 100 BPM
 * 
 * HbA1c — American Diabetes Association (ADA):
 *   - Normal: < 5.7%
 *   - Yüksek Risk (Pre-diyabet): 5.7–6.4%
 *   - Yüksek (Diyabet): ≥ 6.5%
 */

// ── Durum tipleri ──────────────────────────────────────────────────────────

export type HealthStatusLevel = 
  | 'low'       // Düşük
  | 'normal'    // Normal
  | 'elevated'  // Yüksek Normal / Hafif Yüksek
  | 'high'      // Yüksek
  | 'critical'; // Çok Yüksek / Kriz

export interface HealthStatus {
  level: HealthStatusLevel;
  label: string;           // "Düşük", "Normal", "Yüksek" vb.
  color: string;           // UI rengi
  bgColor: string;         // Arka plan rengi (pill/badge için)
  icon: 'arrow-down' | 'swap-horizontal' | 'arrow-up' | 'alert-circle'; // Ionicons ikon adı
}

// ── Renk paleti ────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  low: {
    color: '#D97706',     // Amber
    bgColor: '#FEF3C7',
  },
  normal: {
    color: '#059669',     // Yeşil
    bgColor: '#ECFDF5',
  },
  elevated: {
    color: '#D97706',     // Turuncu
    bgColor: '#FEF3C7',
  },
  high: {
    color: '#DC2626',     // Kırmızı
    bgColor: '#FEE2E2',
  },
  critical: {
    color: '#991B1B',     // Koyu Kırmızı
    bgColor: '#FEE2E2',
  },
} as const;

// ── Kan Şekeri (Glikoz) Sınıflandırması ────────────────────────────────────

export const getBloodSugarStatus = (glucose: number): HealthStatus => {
  if (glucose < 70) {
    return {
      level: 'low',
      label: 'Düşük',
      ...STATUS_COLORS.low,
      icon: 'arrow-down',
    };
  }
  if (glucose <= 99) {
    return {
      level: 'normal',
      label: 'Normal',
      ...STATUS_COLORS.normal,
      icon: 'swap-horizontal',
    };
  }
  if (glucose <= 125) {
    return {
      level: 'elevated',
      label: 'Yüksek Risk',
      ...STATUS_COLORS.elevated,
      icon: 'arrow-up',
    };
  }
  if (glucose <= 250) {
    return {
      level: 'high',
      label: 'Yüksek',
      ...STATUS_COLORS.high,
      icon: 'arrow-up',
    };
  }
  return {
    level: 'critical',
    label: 'Çok Yüksek',
    ...STATUS_COLORS.critical,
    icon: 'alert-circle',
  };
};

// ── Tansiyon (Kan Basıncı) Sınıflandırması ─────────────────────────────────

export const getBloodPressureStatus = (systolic: number, diastolic: number): HealthStatus => {
  if (systolic > 180 || diastolic > 120) {
    return {
      level: 'critical',
      label: 'Kriz',
      ...STATUS_COLORS.critical,
      icon: 'alert-circle',
    };
  }
  if (systolic >= 140 || diastolic >= 90) {
    return {
      level: 'high',
      label: 'Yüksek',
      ...STATUS_COLORS.high,
      icon: 'arrow-up',
    };
  }
  if (systolic >= 130 || (diastolic >= 80 && diastolic < 90)) {
    return {
      level: 'elevated',
      label: 'Hafif Yüksek',
      ...STATUS_COLORS.elevated,
      icon: 'arrow-up',
    };
  }
  if (systolic < 90 || diastolic < 60) {
    return {
      level: 'low',
      label: 'Düşük',
      ...STATUS_COLORS.low,
      icon: 'arrow-down',
    };
  }
  return {
    level: 'normal',
    label: 'Normal',
    ...STATUS_COLORS.normal,
      icon: 'swap-horizontal',
  };
};

// ── Nabız Sınıflandırması ──────────────────────────────────────────────────

export const getPulseStatus = (pulse: number): HealthStatus => {
  if (pulse < 60) {
    return {
      level: 'low',
      label: 'Düşük',
      ...STATUS_COLORS.low,
      icon: 'arrow-down',
    };
  }
  if (pulse <= 100) {
    return {
      level: 'normal',
      label: 'Normal',
      ...STATUS_COLORS.normal,
      icon: 'swap-horizontal',
    };
  }
  return {
    level: 'high',
    label: 'Yüksek',
    ...STATUS_COLORS.high,
    icon: 'arrow-up',
  };
};

// ── HbA1c Sınıflandırması ──────────────────────────────────────────────────

export const getHbA1cStatus = (hba1c: number): HealthStatus => {
  if (hba1c < 5.7) {
    return {
      level: 'normal',
      label: 'Normal',
      ...STATUS_COLORS.normal,
        icon: 'swap-horizontal',
    };
  }
  if (hba1c <= 6.4) {
    return {
      level: 'elevated',
      label: 'Yüksek Risk',
      ...STATUS_COLORS.elevated,
      icon: 'arrow-up',
    };
  }
  return {
    level: 'high',
    label: 'Yüksek',
    ...STATUS_COLORS.high,
    icon: 'arrow-up',
  };
};
