import React, { useMemo } from 'react';
import { formatTime, formatDate } from '../../utils/date';
import type { TimeSlot, TimeSlotPickerProps } from './TimeSlotPicker.types';
import styles from './TimeSlotPicker.module.css';

interface SlotSection {
  label: string;
  slots: TimeSlot[];
}

function getHourInTimezone(date: Date, timezone: string): number {
  const str = date.toLocaleTimeString('en-US', { timeZone: timezone, hour: 'numeric', hour12: false });
  return parseInt(str, 10);
}

function categorizeSlots(slots: TimeSlot[], timezone: string): SlotSection[] {
  const morning: TimeSlot[] = [];
  const afternoon: TimeSlot[] = [];
  const evening: TimeSlot[] = [];

  for (const slot of slots) {
    const hour = getHourInTimezone(slot.startTime, timezone);
    if (hour < 12) {
      morning.push(slot);
    } else if (hour < 17) {
      afternoon.push(slot);
    } else {
      evening.push(slot);
    }
  }

  const sections: SlotSection[] = [];
  if (morning.length > 0) sections.push({ label: 'Morning', slots: morning });
  if (afternoon.length > 0) sections.push({ label: 'Afternoon', slots: afternoon });
  if (evening.length > 0) sections.push({ label: 'Evening', slots: evening });

  return sections;
}

/**
 * TimeSlotPicker displays available appointment time slots organized by
 * morning, afternoon, and evening sections with timezone support.
 */
export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  date,
  availableSlots,
  selectedSlot,
  onSelect,
  timezone,
  slotDuration,
  disabled = false,
}) => {
  const sections = useMemo(
    () => categorizeSlots(availableSlots, timezone),
    [availableSlots, timezone]
  );

  const shortTz = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short',
      }).formatToParts(date);
      const tzPart = parts.find((p) => p.type === 'timeZoneName');
      return tzPart?.value || timezone;
    } catch {
      return timezone;
    }
  }, [timezone, date]);

  if (availableSlots.length === 0) {
    return (
      <div className={styles.container} role="group" aria-label="Time slot picker">
        <div className={styles.header}>
          <h3 className={styles.dateTitle}>{formatDate(date)}</h3>
          <span className={styles.timezone}>{shortTz}</span>
        </div>
        <div className={styles.emptyState}>No available time slots for this date</div>
      </div>
    );
  }

  return (
    <div className={styles.container} role="group" aria-label="Time slot picker">
      <div className={styles.header}>
        <h3 className={styles.dateTitle}>{formatDate(date)}</h3>
        <span className={styles.timezone}>{shortTz}</span>
      </div>

      {sections.map((section) => (
        <div key={section.label} className={styles.section}>
          <h4 className={styles.sectionTitle}>{section.label}</h4>
          <div className={styles.grid} role="radiogroup" aria-label={`${section.label} slots`}>
            {section.slots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              const isUnavailable = !slot.available;

              let className = styles.slot;
              if (isSelected) className = styles.slotSelected;
              else if (isUnavailable) className = styles.slotUnavailable;
              else if (disabled) className = styles.slotDisabled;

              return (
                <button
                  key={slot.id}
                  className={className}
                  role="radio"
                  aria-checked={isSelected}
                  aria-disabled={isUnavailable || disabled}
                  aria-label={`${formatTime(slot.startTime, timezone)}${isUnavailable ? ' (unavailable)' : ''}`}
                  onClick={() => {
                    if (!isUnavailable && !disabled) {
                      onSelect(slot);
                    }
                  }}
                  disabled={isUnavailable || disabled}
                >
                  <div className={styles.slotTime}>
                    {formatTime(slot.startTime, timezone)}
                  </div>
                  {slot.remainingCapacity !== undefined && slot.available && (
                    <div className={styles.slotCapacity}>
                      {slot.remainingCapacity} {slot.remainingCapacity === 1 ? 'spot' : 'spots'} left
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {selectedSlot && (
        <div className={styles.confirmation} role="status">
          <svg className={styles.confirmIcon} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05Z"/>
          </svg>
          Selected: {formatTime(selectedSlot.startTime, timezone)} &ndash;{' '}
          {formatTime(selectedSlot.endTime, timezone)} ({slotDuration} min)
        </div>
      )}
    </div>
  );
};
