export interface AppointmentCardProps {
  /** Patient information */
  patient: {
    name: string;
    avatar?: string;
    dateOfBirth: Date;
    /** Medical Record Number */
    mrn: string;
  };
  /** Appointment details */
  appointment: {
    id: string;
    scheduledTime: Date;
    /** Duration in minutes */
    duration: number;
    type: 'in-person' | 'telehealth' | 'phone';
    status: 'scheduled' | 'checked-in' | 'in-progress' | 'completed' | 'no-show' | 'cancelled';
    reason: string;
  };
  /** Provider information */
  provider?: {
    name: string;
    specialty: string;
  };
  /** Callback when appointment status changes */
  onStatusChange?: (newStatus: string) => void;
  /** Callback when reschedule is requested */
  onReschedule?: () => void;
  /** Callback when cancellation is requested */
  onCancel?: () => void;
}
