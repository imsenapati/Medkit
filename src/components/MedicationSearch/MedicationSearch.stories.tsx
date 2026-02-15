import type { Meta, StoryObj } from '@storybook/react';
import { MedicationSearch } from './MedicationSearch';
import type { Medication } from './MedicationSearch.types';

const mockMedications: Medication[] = [
  { id: '1', brandName: 'Lipitor', genericName: 'Atorvastatin', strength: '20mg', form: 'tablet', controlledSubstance: false, requiresPriorAuth: false },
  { id: '2', brandName: 'Norvasc', genericName: 'Amlodipine', strength: '5mg', form: 'tablet', controlledSubstance: false, requiresPriorAuth: false },
  { id: '3', brandName: 'Adderall', genericName: 'Amphetamine/Dextroamphetamine', strength: '10mg', form: 'tablet', controlledSubstance: true, requiresPriorAuth: true },
  { id: '4', brandName: 'Humira', genericName: 'Adalimumab', strength: '40mg/0.8mL', form: 'injection', controlledSubstance: false, requiresPriorAuth: true },
  { id: '5', brandName: 'Metformin', genericName: 'Metformin HCl', strength: '500mg', form: 'tablet', controlledSubstance: false, requiresPriorAuth: false },
  { id: '6', brandName: 'Amoxicillin', genericName: 'Amoxicillin', strength: '250mg', form: 'capsule', controlledSubstance: false, requiresPriorAuth: false },
];

const mockSearchFn = (query: string): Promise<Medication[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const q = query.toLowerCase();
      resolve(
        mockMedications.filter(
          (m) =>
            m.brandName.toLowerCase().includes(q) ||
            m.genericName.toLowerCase().includes(q)
        )
      );
    }, 500);
  });
};

const meta: Meta<typeof MedicationSearch> = {
  title: 'Components/MedicationSearch',
  component: MedicationSearch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 400 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MedicationSearch>;

export const Default: Story = {
  args: {
    onSelect: (med) => console.log('Selected:', med),
    searchFn: mockSearchFn,
    placeholder: 'Search medications...',
  },
};

export const WithRecentSelections: Story = {
  args: {
    onSelect: (med) => console.log('Selected:', med),
    searchFn: mockSearchFn,
    recentSelections: [mockMedications[0], mockMedications[4]],
  },
};

export const CustomDebounce: Story = {
  args: {
    onSelect: (med) => console.log('Selected:', med),
    searchFn: mockSearchFn,
    debounceMs: 100,
    placeholder: 'Fast search (100ms debounce)...',
  },
};

export const MaxResults: Story = {
  args: {
    onSelect: (med) => console.log('Selected:', med),
    searchFn: mockSearchFn,
    maxResults: 3,
    placeholder: 'Max 3 results...',
  },
};

export const Mobile: Story = {
  args: { ...Default.args },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
