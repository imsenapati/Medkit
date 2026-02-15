import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  convertTemperature,
  convertWeight,
  convertHeight,
  calculateBMI,
  getBMICategory,
  isValueNormal,
  validateVitalValue,
} from '../../utils/vitals';
import type { ValidationError } from '../../utils/vitals';
import type { VitalSigns, VitalSignsInputProps } from './VitalSignsInput.types';
import styles from './VitalSignsInput.module.css';

const DEFAULT_VITALS: VitalSigns = {
  bloodPressureSystolic: 0,
  bloodPressureDiastolic: 0,
  heartRate: 0,
  temperature: 0,
  temperatureUnit: 'F',
  respiratoryRate: 0,
  oxygenSaturation: 0,
  weight: 0,
  weightUnit: 'lb',
  height: 0,
  heightUnit: 'in',
  painLevel: 0,
};

/**
 * VitalSignsInput provides medical-grade input fields for recording patient vital signs.
 * Includes validation, unit conversion, abnormal value highlighting, and BMI calculation.
 */
export const VitalSignsInput: React.FC<VitalSignsInputProps> = ({
  onChange,
  initialValues,
  requiredFields = [],
  onValidationError,
}) => {
  const [vitals, setVitals] = useState<VitalSigns>({ ...DEFAULT_VITALS, ...initialValues });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fieldsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const isRequired = (field: keyof VitalSigns) => requiredFields.includes(field);

  const updateVital = useCallback(
    (field: keyof VitalSigns, value: number | string) => {
      setVitals((prev) => {
        const next = { ...prev, [field]: value };
        return next;
      });
    },
    []
  );

  // Report changes
  useEffect(() => {
    onChange(vitals);
  }, [vitals, onChange]);

  // Run validation
  useEffect(() => {
    const validationErrors: ValidationError[] = [];
    const newErrors: Record<string, string> = {};

    const fieldsToValidate: Array<{ field: string; value: number; unit?: string }> = [
      { field: 'bloodPressureSystolic', value: vitals.bloodPressureSystolic },
      { field: 'bloodPressureDiastolic', value: vitals.bloodPressureDiastolic },
      { field: 'heartRate', value: vitals.heartRate },
      { field: 'temperature', value: vitals.temperature, unit: vitals.temperatureUnit },
      { field: 'respiratoryRate', value: vitals.respiratoryRate },
      { field: 'oxygenSaturation', value: vitals.oxygenSaturation },
      { field: 'weight', value: vitals.weight, unit: vitals.weightUnit },
      { field: 'height', value: vitals.height, unit: vitals.heightUnit },
      { field: 'painLevel', value: vitals.painLevel },
    ];

    for (const { field, value, unit } of fieldsToValidate) {
      if (value === 0) continue;
      const err = validateVitalValue(field, value, unit);
      if (err) {
        validationErrors.push(err);
        newErrors[field] = err.message;
      }
    }

    setErrors(newErrors);
    if (onValidationError && validationErrors.length > 0) {
      onValidationError(validationErrors);
    }
  }, [vitals, onValidationError]);

  const handleNumberInput = (field: keyof VitalSigns) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
    if (!isNaN(val)) {
      updateVital(field, val);
    }
  };

  const getInputClassName = (field: string, unit?: string) => {
    const value = vitals[field as keyof VitalSigns] as number;
    if (!value || value === 0) return styles.input;
    if (errors[field]) return `${styles.input} ${styles.inputError}`;

    const status = isValueNormal(field, value, unit);
    if (status === 'low') return `${styles.input} ${styles.inputAbnormalLow}`;
    if (status === 'high') return `${styles.input} ${styles.inputAbnormalHigh}`;
    return styles.input;
  };

  const getAbnormalIndicator = (field: string, unit?: string) => {
    const value = vitals[field as keyof VitalSigns] as number;
    if (!value || value === 0) return null;
    const status = isValueNormal(field, value, unit);
    if (status === 'low') return <span className={styles.indicatorLow}>Low</span>;
    if (status === 'high') return <span className={styles.indicatorHigh}>High</span>;
    return null;
  };

  const toggleTempUnit = () => {
    const newUnit = vitals.temperatureUnit === 'F' ? 'C' : 'F';
    const newTemp = vitals.temperature > 0
      ? convertTemperature(vitals.temperature, vitals.temperatureUnit)
      : 0;
    setVitals((prev) => ({
      ...prev,
      temperatureUnit: newUnit as 'F' | 'C',
      temperature: newTemp,
    }));
  };

  const toggleWeightUnit = () => {
    const newUnit = vitals.weightUnit === 'lb' ? 'kg' : 'lb';
    const newWeight = vitals.weight > 0
      ? convertWeight(vitals.weight, vitals.weightUnit)
      : 0;
    setVitals((prev) => ({
      ...prev,
      weightUnit: newUnit as 'lb' | 'kg',
      weight: newWeight,
    }));
  };

  const toggleHeightUnit = () => {
    const newUnit = vitals.heightUnit === 'in' ? 'cm' : 'in';
    const newHeight = vitals.height > 0
      ? convertHeight(vitals.height, vitals.heightUnit)
      : 0;
    setVitals((prev) => ({
      ...prev,
      heightUnit: newUnit as 'in' | 'cm',
      height: newHeight,
    }));
  };

  // BMI calculation
  const weightKg = vitals.weight > 0
    ? vitals.weightUnit === 'kg'
      ? vitals.weight
      : convertWeight(vitals.weight, 'lb')
    : 0;
  const heightCm = vitals.height > 0
    ? vitals.heightUnit === 'cm'
      ? vitals.height
      : convertHeight(vitals.height, 'in')
    : 0;
  const bmi = weightKg > 0 && heightCm > 0 ? calculateBMI(weightKg, heightCm) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const bmiCategoryClass: Record<string, string> = {
    Underweight: styles.bmiUnderweight,
    Normal: styles.bmiNormal,
    Overweight: styles.bmiOverweight,
    Obese: styles.bmiObese,
  };

  const handleKeyDown = (fields: string[]) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      const currentField = (e.target as HTMLInputElement).getAttribute('data-field');
      const idx = fields.indexOf(currentField || '');
      if (idx >= 0 && idx < fields.length - 1) {
        e.preventDefault();
        const next = fieldsRef.current[fields[idx + 1]];
        next?.focus();
      }
    }
  };

  const fieldOrder = [
    'bloodPressureSystolic',
    'bloodPressureDiastolic',
    'heartRate',
    'temperature',
    'respiratoryRate',
    'oxygenSaturation',
    'weight',
    'height',
    'painLevel',
  ];

  const displayValue = (val: number) => (val === 0 ? '' : String(val));

  return (
    <div className={styles.container} role="form" aria-label="Vital signs input">
      {/* Blood Pressure & Heart Rate */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Cardiovascular</h3>
        <div className={styles.grid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>
              Blood Pressure
              {(isRequired('bloodPressureSystolic') || isRequired('bloodPressureDiastolic')) && (
                <span className={styles.required} aria-label="required">*</span>
              )}
            </label>
            <div className={styles.bpGroup}>
              <input
                ref={(el) => { fieldsRef.current.bloodPressureSystolic = el; }}
                className={getInputClassName('bloodPressureSystolic').replace(styles.input, styles.bpInput)}
                type="number"
                placeholder="SYS"
                value={displayValue(vitals.bloodPressureSystolic)}
                onChange={handleNumberInput('bloodPressureSystolic')}
                onKeyDown={handleKeyDown(fieldOrder)}
                data-field="bloodPressureSystolic"
                aria-label="Systolic blood pressure"
                min={0}
              />
              <span className={styles.bpSeparator}>/</span>
              <input
                ref={(el) => { fieldsRef.current.bloodPressureDiastolic = el; }}
                className={getInputClassName('bloodPressureDiastolic').replace(styles.input, styles.bpInput)}
                type="number"
                placeholder="DIA"
                value={displayValue(vitals.bloodPressureDiastolic)}
                onChange={handleNumberInput('bloodPressureDiastolic')}
                onKeyDown={handleKeyDown(fieldOrder)}
                data-field="bloodPressureDiastolic"
                aria-label="Diastolic blood pressure"
                min={0}
              />
              <span className={styles.unit}>mmHg</span>
            </div>
            {getAbnormalIndicator('bloodPressureSystolic')}
            {getAbnormalIndicator('bloodPressureDiastolic')}
            {errors.bloodPressureSystolic && <p className={styles.errorText}>{errors.bloodPressureSystolic}</p>}
            {errors.bloodPressureDiastolic && <p className={styles.errorText}>{errors.bloodPressureDiastolic}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="vital-hr">
              Heart Rate
              {isRequired('heartRate') && <span className={styles.required} aria-label="required">*</span>}
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="vital-hr"
                ref={(el) => { fieldsRef.current.heartRate = el; }}
                className={getInputClassName('heartRate')}
                type="number"
                placeholder="0"
                value={displayValue(vitals.heartRate)}
                onChange={handleNumberInput('heartRate')}
                onKeyDown={handleKeyDown(fieldOrder)}
                data-field="heartRate"
                aria-label="Heart rate"
                min={0}
              />
              <span className={styles.unit}>bpm</span>
            </div>
            {getAbnormalIndicator('heartRate')}
            {errors.heartRate && <p className={styles.errorText}>{errors.heartRate}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="vital-o2">
              O₂ Saturation
              {isRequired('oxygenSaturation') && <span className={styles.required} aria-label="required">*</span>}
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="vital-o2"
                ref={(el) => { fieldsRef.current.oxygenSaturation = el; }}
                className={getInputClassName('oxygenSaturation')}
                type="number"
                placeholder="0"
                value={displayValue(vitals.oxygenSaturation)}
                onChange={handleNumberInput('oxygenSaturation')}
                onKeyDown={handleKeyDown(fieldOrder)}
                data-field="oxygenSaturation"
                aria-label="Oxygen saturation"
                min={0}
                max={100}
              />
              <span className={styles.unit}>%</span>
            </div>
            {getAbnormalIndicator('oxygenSaturation')}
            {errors.oxygenSaturation && <p className={styles.errorText}>{errors.oxygenSaturation}</p>}
          </div>
        </div>
      </div>

      {/* Temperature & Respiratory Rate */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Respiratory & Temperature</h3>
        <div className={styles.grid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="vital-temp">
              Temperature
              {isRequired('temperature') && <span className={styles.required} aria-label="required">*</span>}
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="vital-temp"
                ref={(el) => { fieldsRef.current.temperature = el; }}
                className={getInputClassName('temperature', vitals.temperatureUnit)}
                type="number"
                step="0.1"
                placeholder="0"
                value={displayValue(vitals.temperature)}
                onChange={handleNumberInput('temperature')}
                onKeyDown={handleKeyDown(fieldOrder)}
                data-field="temperature"
                aria-label={`Temperature in ${vitals.temperatureUnit === 'F' ? 'Fahrenheit' : 'Celsius'}`}
                min={0}
              />
              <button
                className={styles.unitToggle}
                onClick={toggleTempUnit}
                type="button"
                aria-label={`Switch to ${vitals.temperatureUnit === 'F' ? 'Celsius' : 'Fahrenheit'}`}
              >
                °{vitals.temperatureUnit}
              </button>
            </div>
            {getAbnormalIndicator('temperature', vitals.temperatureUnit)}
            {errors.temperature && <p className={styles.errorText}>{errors.temperature}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="vital-rr">
              Respiratory Rate
              {isRequired('respiratoryRate') && <span className={styles.required} aria-label="required">*</span>}
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="vital-rr"
                ref={(el) => { fieldsRef.current.respiratoryRate = el; }}
                className={getInputClassName('respiratoryRate')}
                type="number"
                placeholder="0"
                value={displayValue(vitals.respiratoryRate)}
                onChange={handleNumberInput('respiratoryRate')}
                onKeyDown={handleKeyDown(fieldOrder)}
                data-field="respiratoryRate"
                aria-label="Respiratory rate"
                min={0}
              />
              <span className={styles.unit}>breaths/min</span>
            </div>
            {getAbnormalIndicator('respiratoryRate')}
            {errors.respiratoryRate && <p className={styles.errorText}>{errors.respiratoryRate}</p>}
          </div>
        </div>
      </div>

      {/* Weight, Height, BMI */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Measurements</h3>
        <div className={styles.grid}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="vital-weight">
              Weight
              {isRequired('weight') && <span className={styles.required} aria-label="required">*</span>}
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="vital-weight"
                ref={(el) => { fieldsRef.current.weight = el; }}
                className={getInputClassName('weight', vitals.weightUnit)}
                type="number"
                step="0.1"
                placeholder="0"
                value={displayValue(vitals.weight)}
                onChange={handleNumberInput('weight')}
                onKeyDown={handleKeyDown(fieldOrder)}
                data-field="weight"
                aria-label={`Weight in ${vitals.weightUnit === 'lb' ? 'pounds' : 'kilograms'}`}
                min={0}
              />
              <button
                className={styles.unitToggle}
                onClick={toggleWeightUnit}
                type="button"
                aria-label={`Switch to ${vitals.weightUnit === 'lb' ? 'kilograms' : 'pounds'}`}
              >
                {vitals.weightUnit}
              </button>
            </div>
            {errors.weight && <p className={styles.errorText}>{errors.weight}</p>}
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="vital-height">
              Height
              {isRequired('height') && <span className={styles.required} aria-label="required">*</span>}
            </label>
            <div className={styles.inputWrapper}>
              <input
                id="vital-height"
                ref={(el) => { fieldsRef.current.height = el; }}
                className={getInputClassName('height', vitals.heightUnit)}
                type="number"
                step="0.1"
                placeholder="0"
                value={displayValue(vitals.height)}
                onChange={handleNumberInput('height')}
                onKeyDown={handleKeyDown(fieldOrder)}
                data-field="height"
                aria-label={`Height in ${vitals.heightUnit === 'in' ? 'inches' : 'centimeters'}`}
                min={0}
              />
              <button
                className={styles.unitToggle}
                onClick={toggleHeightUnit}
                type="button"
                aria-label={`Switch to ${vitals.heightUnit === 'in' ? 'centimeters' : 'inches'}`}
              >
                {vitals.heightUnit}
              </button>
            </div>
            {errors.height && <p className={styles.errorText}>{errors.height}</p>}
          </div>
        </div>

        {bmi !== null && (
          <div className={styles.bmiDisplay} role="status" aria-label={`BMI: ${bmi}`}>
            <div>
              <span className={styles.bmiValue}>{bmi}</span>
            </div>
            <div>
              <div className={styles.bmiLabel}>BMI</div>
              {bmiCategory && (
                <div className={`${styles.bmiCategory} ${bmiCategoryClass[bmiCategory] || ''}`}>
                  {bmiCategory}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pain Level */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Pain Assessment</h3>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>
            Pain Level (0-10)
            {isRequired('painLevel') && <span className={styles.required} aria-label="required">*</span>}
          </label>
          <div className={styles.painScale} role="radiogroup" aria-label="Pain level">
            {Array.from({ length: 11 }, (_, i) => {
              const isSelected = vitals.painLevel === i;
              const isHigh = i >= 7;
              let className = styles.painButton;
              if (isSelected && isHigh) className = `${styles.painButton} ${styles.painButtonHigh}`;
              else if (isSelected) className = `${styles.painButton} ${styles.painButtonSelected}`;

              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Pain level ${i}`}
                  className={className}
                  onClick={() => updateVital('painLevel', i)}
                >
                  {i}
                </button>
              );
            })}
          </div>
          {getAbnormalIndicator('painLevel')}
        </div>
      </div>
    </div>
  );
};
