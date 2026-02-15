import React, { useState, useRef, useEffect } from 'react';
import { calculateAge, formatTime, formatDate, formatDuration } from '../../utils/date';
import type { AppointmentCardProps } from './AppointmentCard.types';
import styles from './AppointmentCard.module.css';

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Scheduled',
  'checked-in': 'Checked In',
  'in-progress': 'In Progress',
  completed: 'Completed',
  'no-show': 'No Show',
  cancelled: 'Cancelled',
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  scheduled: styles.badgeScheduled,
  'checked-in': styles.badgeCheckedIn,
  'in-progress': styles.badgeInProgress,
  completed: styles.badgeCompleted,
  'no-show': styles.badgeNoShow,
  cancelled: styles.badgeCancelled,
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  'in-person': (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16" aria-hidden="true">
      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"/>
    </svg>
  ),
  telehealth: (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16" aria-hidden="true">
      <path d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5Zm11.5 5.175 3.5 1.556V4.269l-3.5 1.556v4.35ZM2 4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h7.5a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H2Z"/>
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16" aria-hidden="true">
      <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328ZM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511Z"/>
    </svg>
  ),
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * AppointmentCard displays appointment information with patient details,
 * scheduling info, status badge, and action controls.
 */
export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  patient,
  appointment,
  provider,
  onStatusChange,
  onReschedule,
  onCancel,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const age = calculateAge(patient.dateOfBirth);
  const isTerminal = appointment.status === 'completed' || appointment.status === 'cancelled';

  const nextStatusMap: Record<string, string | null> = {
    scheduled: 'checked-in',
    'checked-in': 'in-progress',
    'in-progress': 'completed',
    completed: null,
    'no-show': null,
    cancelled: null,
  };

  const nextStatus = nextStatusMap[appointment.status];

  return (
    <div className={styles.card} role="article" aria-label={`Appointment for ${patient.name}`}>
      <div className={styles.header}>
        <div className={styles.patientInfo}>
          {patient.avatar ? (
            <img
              className={styles.avatar}
              src={patient.avatar}
              alt={`${patient.name} avatar`}
            />
          ) : (
            <div className={styles.avatarPlaceholder} aria-hidden="true">
              {getInitials(patient.name)}
            </div>
          )}
          <div className={styles.patientDetails}>
            <p className={styles.patientName}>{patient.name}</p>
            <p className={styles.patientMeta}>
              Age {age} &middot; MRN: {patient.mrn}
            </p>
          </div>
        </div>
        <span className={`${styles.badge} ${STATUS_BADGE_CLASS[appointment.status] || ''}`}>
          {STATUS_LABELS[appointment.status] || appointment.status}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.row}>
          <span className={styles.icon} aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
              <path d="M4 .5a.5.5 0 0 0-1 0V1H2a2 2 0 0 0-2 2v1h16V3a2 2 0 0 0-2-2h-1V.5a.5.5 0 0 0-1 0V1H4V.5ZM16 14V5H0v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z"/>
            </svg>
          </span>
          <span>
            {formatDate(appointment.scheduledTime)} at{' '}
            {formatTime(appointment.scheduledTime)} &middot;{' '}
            {formatDuration(appointment.duration)}
          </span>
        </div>

        <div className={styles.row}>
          <span className={styles.typeIcon}>{TYPE_ICONS[appointment.type]}</span>
          <span style={{ textTransform: 'capitalize' }}>{appointment.type}</span>
        </div>

        {appointment.reason && (
          <div className={styles.row}>
            <span className={styles.icon} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16Zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.399l-.451.004.088-.416C7.353 7.322 8.087 7 8.72 7c.607 0 .858.39.687 1.188ZM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>
              </svg>
            </span>
            <span>{appointment.reason}</span>
          </div>
        )}

        {provider && (
          <div className={styles.row}>
            <span className={styles.icon} aria-hidden="true">
              <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Z"/>
              </svg>
            </span>
            <span className={styles.providerRow}>
              {provider.name} &middot; {provider.specialty}
            </span>
          </div>
        )}
      </div>

      {!isTerminal && (
        <div className={styles.footer}>
          {nextStatus && onStatusChange && (
            <button
              className={styles.actionBtnPrimary}
              onClick={() => onStatusChange(nextStatus)}
              aria-label={`Change status to ${STATUS_LABELS[nextStatus]}`}
            >
              {STATUS_LABELS[nextStatus]}
            </button>
          )}

          <div className={styles.dropdownWrapper} ref={menuRef}>
            <button
              className={styles.actionBtn}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-label="More actions"
            >
              &#8943;
            </button>
            {menuOpen && (
              <div className={styles.dropdownMenu} role="menu">
                {onStatusChange && (
                  <button
                    className={styles.dropdownItem}
                    role="menuitem"
                    onClick={() => {
                      onStatusChange('no-show');
                      setMenuOpen(false);
                    }}
                  >
                    Mark No Show
                  </button>
                )}
                {onReschedule && (
                  <button
                    className={styles.dropdownItem}
                    role="menuitem"
                    onClick={() => {
                      onReschedule();
                      setMenuOpen(false);
                    }}
                  >
                    Reschedule
                  </button>
                )}
                {onCancel && (
                  <button
                    className={styles.dropdownItemDanger}
                    role="menuitem"
                    onClick={() => {
                      onCancel();
                      setMenuOpen(false);
                    }}
                  >
                    Cancel Appointment
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
