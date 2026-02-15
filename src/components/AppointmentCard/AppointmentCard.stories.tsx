import type { Meta, StoryObj } from '@storybook/react';
import { AppointmentCard } from './AppointmentCard';

const meta: Meta<typeof AppointmentCard> = {
  title: 'Components/AppointmentCard',
  component: AppointmentCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 440, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppointmentCard>;

const basePatient = {
  name: 'Sarah Johnson',
  dateOfBirth: new Date('1990-05-15'),
  mrn: 'MRN-001234',
};

const baseAppointment = {
  id: 'appt-001',
  scheduledTime: new Date('2025-03-15T10:30:00'),
  duration: 30,
  type: 'in-person' as const,
  status: 'scheduled' as const,
  reason: 'Annual physical exam',
};

const baseProvider = {
  name: 'Dr. Emily Chen',
  specialty: 'Internal Medicine',
};

export const Default: Story = {
  args: {
    patient: basePatient,
    appointment: baseAppointment,
    provider: baseProvider,
    onStatusChange: (status) => console.log('Status changed to:', status),
    onReschedule: () => console.log('Reschedule clicked'),
    onCancel: () => console.log('Cancel clicked'),
  },
};

export const CheckedIn: Story = {
  args: {
    ...Default.args,
    appointment: { ...baseAppointment, status: 'checked-in' },
  },
};

export const InProgress: Story = {
  args: {
    ...Default.args,
    appointment: { ...baseAppointment, status: 'in-progress' },
  },
};

export const Completed: Story = {
  args: {
    ...Default.args,
    appointment: { ...baseAppointment, status: 'completed' },
  },
};

export const NoShow: Story = {
  args: {
    ...Default.args,
    appointment: { ...baseAppointment, status: 'no-show' },
  },
};

export const Cancelled: Story = {
  args: {
    ...Default.args,
    appointment: { ...baseAppointment, status: 'cancelled' },
  },
};

export const Telehealth: Story = {
  args: {
    ...Default.args,
    appointment: { ...baseAppointment, type: 'telehealth', reason: 'Follow-up consultation' },
  },
};

export const Phone: Story = {
  args: {
    ...Default.args,
    appointment: { ...baseAppointment, type: 'phone', reason: 'Lab results review' },
  },
};

export const WithAvatar: Story = {
  args: {
    ...Default.args,
    patient: {
      ...basePatient,
      avatar: 'https://i.pravatar.cc/80?img=5',
    },
  },
};

export const NoProvider: Story = {
  args: {
    patient: basePatient,
    appointment: baseAppointment,
    onStatusChange: (status) => console.log('Status changed to:', status),
  },
};

export const Mobile: Story = {
  args: { ...Default.args },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
