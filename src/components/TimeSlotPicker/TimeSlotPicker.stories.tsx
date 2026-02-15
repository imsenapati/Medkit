import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TimeSlotPicker } from './TimeSlotPicker';
import type { TimeSlot } from './TimeSlotPicker.types';

function createSlots(date: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const baseDate = new Date(date);

  const hours = [8, 8.5, 9, 9.5, 10, 10.5, 11, 13, 13.5, 14, 14.5, 15, 15.5, 16, 17, 17.5, 18];
  hours.forEach((h, i) => {
    const startTime = new Date(baseDate);
    startTime.setHours(Math.floor(h), (h % 1) * 60, 0, 0);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30);

    slots.push({
      id: `slot-${i}`,
      startTime,
      endTime,
      available: i !== 3 && i !== 7 && i !== 12,
      remainingCapacity: i === 5 ? 2 : undefined,
    });
  });

  return slots;
}

const today = new Date();
const sampleSlots = createSlots(today);

const meta: Meta<typeof TimeSlotPicker> = {
  title: 'Components/TimeSlotPicker',
  component: TimeSlotPicker,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 480, width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TimeSlotPicker>;

export const Default: Story = {
  args: {
    date: today,
    availableSlots: sampleSlots,
    timezone: 'America/New_York',
    slotDuration: 30,
    onSelect: (slot) => console.log('Selected:', slot),
  },
};

const InteractiveComponent = () => {
  const [selected, setSelected] = useState<TimeSlot | undefined>(undefined);
  return (
    <TimeSlotPicker
      date={today}
      availableSlots={sampleSlots}
      selectedSlot={selected}
      onSelect={setSelected}
      timezone="America/New_York"
      slotDuration={30}
    />
  );
};

export const Interactive: Story = {
  render: () => <InteractiveComponent />,
};

export const WithSelectedSlot: Story = {
  args: {
    ...Default.args,
    selectedSlot: sampleSlots[1],
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const NoSlots: Story = {
  args: {
    date: today,
    availableSlots: [],
    timezone: 'America/New_York',
    slotDuration: 30,
    onSelect: () => {},
  },
};

export const Mobile: Story = {
  args: { ...Default.args },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};
