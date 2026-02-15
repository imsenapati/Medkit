/**
 * Normal ranges for vital signs used for validation and abnormal value detection.
 */
export const VITAL_RANGES = {
  bloodPressureSystolic: { min: 70, max: 200, normalMin: 90, normalMax: 140, unit: 'mmHg' },
  bloodPressureDiastolic: { min: 40, max: 130, normalMin: 60, normalMax: 90, unit: 'mmHg' },
  heartRate: { min: 30, max: 250, normalMin: 60, normalMax: 100, unit: 'bpm' },
  temperatureF: { min: 90, max: 110, normalMin: 97.0, normalMax: 99.5, unit: '°F' },
  temperatureC: { min: 32.2, max: 43.3, normalMin: 36.1, normalMax: 37.5, unit: '°C' },
  respiratoryRate: { min: 8, max: 40, normalMin: 12, normalMax: 20, unit: 'breaths/min' },
  oxygenSaturation: { min: 70, max: 100, normalMin: 95, normalMax: 100, unit: '%' },
  weightLb: { min: 1, max: 1000, unit: 'lb' },
  weightKg: { min: 0.5, max: 450, unit: 'kg' },
  heightIn: { min: 10, max: 108, unit: 'in' },
  heightCm: { min: 25, max: 275, unit: 'cm' },
  painLevel: { min: 0, max: 10, normalMin: 0, normalMax: 3, unit: '' },
} as const;

/**
 * Convert temperature between Fahrenheit and Celsius.
 */
export function convertTemperature(value: number, from: 'F' | 'C'): number {
  if (from === 'F') return Number(((value - 32) * (5 / 9)).toFixed(1));
  return Number((value * (9 / 5) + 32).toFixed(1));
}

/**
 * Convert weight between pounds and kilograms.
 */
export function convertWeight(value: number, from: 'lb' | 'kg'): number {
  if (from === 'lb') return Number((value * 0.453592).toFixed(1));
  return Number((value / 0.453592).toFixed(1));
}

/**
 * Convert height between inches and centimeters.
 */
export function convertHeight(value: number, from: 'in' | 'cm'): number {
  if (from === 'in') return Number((value * 2.54).toFixed(1));
  return Number((value / 2.54).toFixed(1));
}

/**
 * Calculate BMI from weight (kg) and height (cm).
 * @returns BMI value rounded to 1 decimal place, or null if inputs are invalid.
 */
export function calculateBMI(weightKg: number, heightCm: number): number | null {
  if (weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

/**
 * Get BMI category label.
 */
export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

/**
 * Check if a vital sign value is within the normal range.
 */
export function isValueNormal(
  field: string,
  value: number,
  unit?: string
): 'normal' | 'low' | 'high' | 'unknown' {
  let rangeKey: string = field;

  if (field === 'temperature') {
    rangeKey = unit === 'C' ? 'temperatureC' : 'temperatureF';
  } else if (field === 'weight') {
    rangeKey = unit === 'kg' ? 'weightKg' : 'weightLb';
  } else if (field === 'height') {
    rangeKey = unit === 'cm' ? 'heightCm' : 'heightIn';
  }

  const range = VITAL_RANGES[rangeKey as keyof typeof VITAL_RANGES];
  if (!range || !('normalMin' in range)) return 'unknown';

  const { normalMin, normalMax } = range as { normalMin: number; normalMax: number };
  if (value < normalMin) return 'low';
  if (value > normalMax) return 'high';
  return 'normal';
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate a vital sign value against medical-grade ranges.
 */
export function validateVitalValue(
  field: string,
  value: number | undefined,
  unit?: string
): ValidationError | null {
  if (value === undefined || value === null || isNaN(value)) return null;

  let rangeKey: string = field;
  if (field === 'temperature') {
    rangeKey = unit === 'C' ? 'temperatureC' : 'temperatureF';
  } else if (field === 'weight') {
    rangeKey = unit === 'kg' ? 'weightKg' : 'weightLb';
  } else if (field === 'height') {
    rangeKey = unit === 'cm' ? 'heightCm' : 'heightIn';
  }

  const range = VITAL_RANGES[rangeKey as keyof typeof VITAL_RANGES];
  if (!range) return null;

  if (value < range.min || value > range.max) {
    return {
      field,
      message: `${field} must be between ${range.min} and ${range.max} ${range.unit}`,
    };
  }

  return null;
}
