import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { VitalSignsInput } from './VitalSignsInput';

describe('VitalSignsInput', () => {
  it('renders all vital sign sections', () => {
    render(<VitalSignsInput onChange={() => {}} />);
    expect(screen.getByText('Cardiovascular')).toBeInTheDocument();
    expect(screen.getByText('Respiratory & Temperature')).toBeInTheDocument();
    expect(screen.getByText('Measurements')).toBeInTheDocument();
    expect(screen.getByText('Pain Assessment')).toBeInTheDocument();
  });

  it('has form role with accessible label', () => {
    render(<VitalSignsInput onChange={() => {}} />);
    expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'Vital signs input');
  });

  it('renders with initial values', () => {
    render(
      <VitalSignsInput
        onChange={() => {}}
        initialValues={{
          heartRate: 72,
          bloodPressureSystolic: 120,
          bloodPressureDiastolic: 80,
        }}
      />
    );
    const hrInput = screen.getByLabelText('Heart rate');
    expect(hrInput).toHaveValue(72);
  });

  it('calls onChange when values are updated', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<VitalSignsInput onChange={onChange} />);

    const hrInput = screen.getByLabelText('Heart rate');
    await user.click(hrInput);
    await user.type(hrInput, '80');

    // onChange should have been called
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.heartRate).toBe(80);
  });

  it('shows required indicator for required fields', () => {
    render(
      <VitalSignsInput
        onChange={() => {}}
        requiredFields={['heartRate']}
      />
    );
    const indicators = screen.getAllByLabelText('required');
    expect(indicators.length).toBeGreaterThan(0);
  });

  it('toggles temperature unit between F and C', async () => {
    const user = userEvent.setup();
    render(
      <VitalSignsInput
        onChange={() => {}}
        initialValues={{ temperature: 98.6, temperatureUnit: 'F' }}
      />
    );

    const toggleBtn = screen.getByLabelText('Switch to Celsius');
    await user.click(toggleBtn);

    // Should now show C
    expect(screen.getByLabelText('Switch to Fahrenheit')).toBeInTheDocument();
  });

  it('toggles weight unit between lb and kg', async () => {
    const user = userEvent.setup();
    render(
      <VitalSignsInput
        onChange={() => {}}
        initialValues={{ weight: 165, weightUnit: 'lb' }}
      />
    );

    const toggleBtn = screen.getByLabelText('Switch to kilograms');
    await user.click(toggleBtn);
    expect(screen.getByLabelText('Switch to pounds')).toBeInTheDocument();
  });

  it('toggles height unit between in and cm', async () => {
    const user = userEvent.setup();
    render(
      <VitalSignsInput
        onChange={() => {}}
        initialValues={{ height: 70, heightUnit: 'in' }}
      />
    );

    const toggleBtn = screen.getByLabelText('Switch to centimeters');
    await user.click(toggleBtn);
    expect(screen.getByLabelText('Switch to inches')).toBeInTheDocument();
  });

  it('calculates and displays BMI when weight and height are provided', () => {
    render(
      <VitalSignsInput
        onChange={() => {}}
        initialValues={{
          weight: 70,
          weightUnit: 'kg',
          height: 175,
          heightUnit: 'cm',
        }}
      />
    );
    expect(screen.getByText('BMI')).toBeInTheDocument();
    // BMI = 70 / (1.75)^2 ≈ 22.9
    expect(screen.getByRole('status', { name: /BMI/ })).toBeInTheDocument();
  });

  it('does not display BMI when weight or height is zero', () => {
    render(<VitalSignsInput onChange={() => {}} />);
    expect(screen.queryByText('BMI')).not.toBeInTheDocument();
  });

  it('renders pain level radio buttons 0-10', () => {
    render(<VitalSignsInput onChange={() => {}} />);
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(11);
  });

  it('selects pain level when clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<VitalSignsInput onChange={onChange} />);

    const painBtn = screen.getByRole('radio', { name: 'Pain level 5' });
    await user.click(painBtn);

    expect(painBtn).toHaveAttribute('aria-checked', 'true');
  });

  it('shows abnormal indicator for high blood pressure', () => {
    render(
      <VitalSignsInput
        onChange={() => {}}
        initialValues={{
          bloodPressureSystolic: 160,
          bloodPressureDiastolic: 95,
        }}
      />
    );
    const highIndicators = screen.getAllByText('High');
    expect(highIndicators.length).toBeGreaterThan(0);
  });

  it('calls onValidationError for out-of-range values', () => {
    const onValidationError = vi.fn();
    render(
      <VitalSignsInput
        onChange={() => {}}
        onValidationError={onValidationError}
        initialValues={{
          heartRate: 300, // Way out of range
        }}
      />
    );
    expect(onValidationError).toHaveBeenCalled();
  });

  it('has accessible labels on all input fields', () => {
    render(<VitalSignsInput onChange={() => {}} />);
    expect(screen.getByLabelText('Systolic blood pressure')).toBeInTheDocument();
    expect(screen.getByLabelText('Diastolic blood pressure')).toBeInTheDocument();
    expect(screen.getByLabelText('Heart rate')).toBeInTheDocument();
    expect(screen.getByLabelText(/Temperature in/)).toBeInTheDocument();
    expect(screen.getByLabelText('Respiratory rate')).toBeInTheDocument();
    expect(screen.getByLabelText('Oxygen saturation')).toBeInTheDocument();
    expect(screen.getByLabelText(/Weight in/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Height in/)).toBeInTheDocument();
  });
});
