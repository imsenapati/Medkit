import type { Meta, StoryObj } from '@storybook/react';
import { VitalSignsInput } from './VitalSignsInput';

const meta: Meta<typeof VitalSignsInput> = {
  title: 'Components/VitalSignsInput',
  component: VitalSignsInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof VitalSignsInput>;

export const Default: Story = {
  args: {
    onChange: (vitals) => console.log('Vitals changed:', vitals),
  },
};

export const WithInitialValues: Story = {
  args: {
    onChange: (vitals) => console.log('Vitals changed:', vitals),
    initialValues: {
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 72,
      temperature: 98.6,
      temperatureUnit: 'F',
      respiratoryRate: 16,
      oxygenSaturation: 98,
      weight: 165,
      weightUnit: 'lb',
      height: 70,
      heightUnit: 'in',
      painLevel: 2,
    },
  },
};

export const AbnormalValues: Story = {
  args: {
    onChange: (vitals) => console.log('Vitals changed:', vitals),
    initialValues: {
      bloodPressureSystolic: 160,
      bloodPressureDiastolic: 95,
      heartRate: 110,
      temperature: 101.5,
      temperatureUnit: 'F',
      respiratoryRate: 24,
      oxygenSaturation: 92,
      painLevel: 8,
    },
  },
};

export const WithRequiredFields: Story = {
  args: {
    onChange: (vitals) => console.log('Vitals changed:', vitals),
    requiredFields: ['bloodPressureSystolic', 'bloodPressureDiastolic', 'heartRate', 'temperature'],
  },
};

export const CelsiusMode: Story = {
  args: {
    onChange: (vitals) => console.log('Vitals changed:', vitals),
    initialValues: {
      temperature: 37.0,
      temperatureUnit: 'C',
    },
  },
};

export const MetricUnits: Story = {
  args: {
    onChange: (vitals) => console.log('Vitals changed:', vitals),
    initialValues: {
      weight: 75,
      weightUnit: 'kg',
      height: 178,
      heightUnit: 'cm',
    },
  },
};

export const Mobile: Story = {
  args: { ...Default.args },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
