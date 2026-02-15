import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeSlotPicker } from './TimeSlotPicker';
import type { TimeSlot } from './TimeSlotPicker.types';

const date = new Date('2025-03-15T00:00:00');

// Use UTC times that map to Eastern Time hours (EDT = UTC-4):
// 13:00 UTC = 9:00 AM EDT (morning)
// 18:00 UTC = 2:00 PM EDT (afternoon)
// 23:00 UTC = 7:00 PM EDT (evening)
// 14:00 UTC = 10:00 AM EDT (morning, unavailable)
function makeSlot(utcHour: number, available = true, id?: string): TimeSlot {
  const startTime = new Date(`2025-03-15T${String(utcHour).padStart(2, '0')}:00:00Z`);
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000);
  return {
    id: id || `slot-${utcHour}`,
    startTime,
    endTime,
    available,
  };
}

const morningSlot = makeSlot(13, true, 'morning');      // 9 AM EDT
const afternoonSlot = makeSlot(18, true, 'afternoon');   // 2 PM EDT
const eveningSlot = makeSlot(23, true, 'evening');       // 7 PM EDT
const unavailableSlot = makeSlot(14, false, 'unavailable'); // 10 AM EDT

const allSlots = [morningSlot, unavailableSlot, afternoonSlot, eveningSlot];

describe('TimeSlotPicker', () => {
  it('renders date and timezone', () => {
    render(
      <TimeSlotPicker
        date={date}
        availableSlots={allSlots}
        onSelect={() => {}}
        timezone="America/New_York"
        slotDuration={30}
      />
    );
    expect(screen.getByText('Mar 15, 2025')).toBeInTheDocument();
    // Should show short timezone
    expect(screen.getByText(/E[SD]T/)).toBeInTheDocument();
  });

  it('has group role with accessible label', () => {
    render(
      <TimeSlotPicker
        date={date}
        availableSlots={allSlots}
        onSelect={() => {}}
        timezone="America/New_York"
        slotDuration={30}
      />
    );
    expect(screen.getByRole('group', { name: 'Time slot picker' })).toBeInTheDocument();
  });

  it('organizes slots into morning, afternoon, and evening sections', () => {
    render(
      <TimeSlotPicker
        date={date}
        availableSlots={allSlots}
        onSelect={() => {}}
        timezone="America/New_York"
        slotDuration={30}
      />
    );
    expect(screen.getByText('Morning')).toBeInTheDocument();
    expect(screen.getByText('Afternoon')).toBeInTheDocument();
    expect(screen.getByText('Evening')).toBeInTheDocument();
  });

  it('shows empty state when no slots', () => {
    render(
      <TimeSlotPicker
        date={date}
        availableSlots={[]}
        onSelect={() => {}}
        timezone="America/New_York"
        slotDuration={30}
      />
    );
    expect(screen.getByText('No available time slots for this date')).toBeInTheDocument();
  });

  it('calls onSelect when an available slot is clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <TimeSlotPicker
        date={date}
        availableSlots={[morningSlot]}
        onSelect={onSelect}
        timezone="America/New_York"
        slotDuration={30}
      />
    );

    const radios = screen.getAllByRole('radio');
    await user.click(radios[0]);
    expect(onSelect).toHaveBeenCalledWith(morningSlot);
  });

  it('does not call onSelect for unavailable slots', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <TimeSlotPicker
        date={date}
        availableSlots={[unavailableSlot]}
        onSelect={onSelect}
        timezone="America/New_York"
        slotDuration={30}
      />
    );

    const radio = screen.getByRole('radio');
    await user.click(radio);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('marks unavailable slots with aria-disabled', () => {
    render(
      <TimeSlotPicker
        date={date}
        availableSlots={[unavailableSlot]}
        onSelect={() => {}}
        timezone="America/New_York"
        slotDuration={30}
      />
    );
    const radio = screen.getByRole('radio');
    expect(radio).toBeDisabled();
  });

  it('highlights selected slot', () => {
    render(
      <TimeSlotPicker
        date={date}
        availableSlots={[morningSlot]}
        selectedSlot={morningSlot}
        onSelect={() => {}}
        timezone="America/New_York"
        slotDuration={30}
      />
    );
    const radio = screen.getByRole('radio');
    expect(radio).toHaveAttribute('aria-checked', 'true');
  });

  it('shows confirmation when slot is selected', () => {
    render(
      <TimeSlotPicker
        date={date}
        availableSlots={[morningSlot]}
        selectedSlot={morningSlot}
        onSelect={() => {}}
        timezone="America/New_York"
        slotDuration={30}
      />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/Selected:/)).toBeInTheDocument();
  });

  it('shows remaining capacity for group slots', () => {
    const groupSlot: TimeSlot = {
      ...morningSlot,
      remainingCapacity: 3,
    };

    render(
      <TimeSlotPicker
        date={date}
        availableSlots={[groupSlot]}
        onSelect={() => {}}
        timezone="America/New_York"
        slotDuration={30}
      />
    );
    expect(screen.getByText('3 spots left')).toBeInTheDocument();
  });

  it('shows singular "spot" for capacity of 1', () => {
    const groupSlot: TimeSlot = {
      ...morningSlot,
      remainingCapacity: 1,
    };

    render(
      <TimeSlotPicker
        date={date}
        availableSlots={[groupSlot]}
        onSelect={() => {}}
        timezone="America/New_York"
        slotDuration={30}
      />
    );
    expect(screen.getByText('1 spot left')).toBeInTheDocument();
  });

  it('disables all slots when disabled prop is true', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <TimeSlotPicker
        date={date}
        availableSlots={[morningSlot]}
        onSelect={onSelect}
        timezone="America/New_York"
        slotDuration={30}
        disabled
      />
    );

    const radio = screen.getByRole('radio');
    await user.click(radio);
    expect(onSelect).not.toHaveBeenCalled();
  });
});
