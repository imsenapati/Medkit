export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  available: boolean;
  /** Remaining capacity for group appointments */
  remainingCapacity?: number;
}

export interface TimeSlotPickerProps {
  /** The date for which to display time slots */
  date: Date;
  /** Available time slots */
  availableSlots: TimeSlot[];
  /** Currently selected slot */
  selectedSlot?: TimeSlot;
  /** Called when a slot is selected */
  onSelect: (slot: TimeSlot) => void;
  /** IANA timezone string */
  timezone: string;
  /** Slot duration in minutes */
  slotDuration: number;
  /** Disable the entire picker */
  disabled?: boolean;
}
