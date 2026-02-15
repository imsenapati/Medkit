// Components
export { AppointmentCard } from './components/AppointmentCard';
export type { AppointmentCardProps } from './components/AppointmentCard';

export { VitalSignsInput } from './components/VitalSignsInput';
export type { VitalSignsInputProps, VitalSigns } from './components/VitalSignsInput';

export { MedicationSearch } from './components/MedicationSearch';
export type { MedicationSearchProps, Medication } from './components/MedicationSearch';

export { TimeSlotPicker } from './components/TimeSlotPicker';
export type { TimeSlotPickerProps, TimeSlot } from './components/TimeSlotPicker';

export { DataTable } from './components/DataTable';
export type { DataTableProps, ColumnDef } from './components/DataTable';

// Utilities
export {
  calculateAge,
  formatTime,
  formatDate,
  formatDuration,
  convertTemperature,
  convertWeight,
  convertHeight,
  calculateBMI,
  getBMICategory,
  isValueNormal,
  validateVitalValue,
  VITAL_RANGES,
} from './utils';
export type { ValidationError } from './utils';

// Hooks
export { useDebounce } from './hooks';
