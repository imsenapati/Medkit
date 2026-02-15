import type { ValidationError } from '../../utils/vitals';

export interface VitalSigns {
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  heartRate: number;
  temperature: number;
  temperatureUnit: 'F' | 'C';
  respiratoryRate: number;
  oxygenSaturation: number;
  weight: number;
  weightUnit: 'lb' | 'kg';
  height: number;
  heightUnit: 'in' | 'cm';
  /** Pain level from 0-10 */
  painLevel: number;
}

export interface VitalSignsInputProps {
  /** Called when any vital sign value changes */
  onChange: (vitals: VitalSigns) => void;
  /** Pre-populate fields */
  initialValues?: Partial<VitalSigns>;
  /** Fields that must be filled in */
  requiredFields?: (keyof VitalSigns)[];
  /** Called when validation errors occur */
  onValidationError?: (errors: ValidationError[]) => void;
}
