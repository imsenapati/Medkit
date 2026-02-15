import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppointmentCard } from './AppointmentCard';
import type { AppointmentCardProps } from './AppointmentCard.types';

const defaultProps: AppointmentCardProps = {
  patient: {
    name: 'Sarah Johnson',
    dateOfBirth: new Date('1990-05-15'),
    mrn: 'MRN-001234',
  },
  appointment: {
    id: 'appt-001',
    scheduledTime: new Date('2025-03-15T10:30:00'),
    duration: 30,
    type: 'in-person',
    status: 'scheduled',
    reason: 'Annual physical exam',
  },
  provider: {
    name: 'Dr. Emily Chen',
    specialty: 'Internal Medicine',
  },
};

describe('AppointmentCard', () => {
  it('renders patient name and MRN', () => {
    render(<AppointmentCard {...defaultProps} />);
    expect(screen.getByText('Sarah Johnson')).toBeInTheDocument();
    expect(screen.getByText(/MRN-001234/)).toBeInTheDocument();
  });

  it('calculates and displays patient age from DOB', () => {
    render(<AppointmentCard {...defaultProps} />);
    // Age should be calculated from DOB
    expect(screen.getByText(/Age \d+/)).toBeInTheDocument();
  });

  it('shows initials when no avatar is provided', () => {
    render(<AppointmentCard {...defaultProps} />);
    expect(screen.getByText('SJ')).toBeInTheDocument();
  });

  it('shows avatar image when provided', () => {
    render(
      <AppointmentCard
        {...defaultProps}
        patient={{ ...defaultProps.patient, avatar: 'https://example.com/avatar.jpg' }}
      />
    );
    const img = screen.getByAltText('Sarah Johnson avatar');
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('displays correct status badge', () => {
    render(<AppointmentCard {...defaultProps} />);
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it.each([
    ['checked-in', 'Checked In'],
    ['in-progress', 'In Progress'],
    ['completed', 'Completed'],
    ['no-show', 'No Show'],
    ['cancelled', 'Cancelled'],
  ] as const)('displays %s status as "%s"', (status, label) => {
    render(
      <AppointmentCard
        {...defaultProps}
        appointment={{ ...defaultProps.appointment, status }}
      />
    );
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('shows appointment type', () => {
    render(<AppointmentCard {...defaultProps} />);
    expect(screen.getByText('in-person')).toBeInTheDocument();
  });

  it('displays appointment reason', () => {
    render(<AppointmentCard {...defaultProps} />);
    expect(screen.getByText('Annual physical exam')).toBeInTheDocument();
  });

  it('displays provider info', () => {
    render(<AppointmentCard {...defaultProps} />);
    expect(screen.getByText(/Dr\. Emily Chen/)).toBeInTheDocument();
    expect(screen.getByText(/Internal Medicine/)).toBeInTheDocument();
  });

  it('calls onStatusChange with next status when primary button is clicked', async () => {
    const onStatusChange = vi.fn();
    const user = userEvent.setup();
    render(<AppointmentCard {...defaultProps} onStatusChange={onStatusChange} />);

    const btn = screen.getByRole('button', { name: /Change status to Checked In/i });
    await user.click(btn);
    expect(onStatusChange).toHaveBeenCalledWith('checked-in');
  });

  it('opens dropdown menu and calls onReschedule', async () => {
    const onReschedule = vi.fn();
    const user = userEvent.setup();
    render(
      <AppointmentCard
        {...defaultProps}
        onReschedule={onReschedule}
        onCancel={() => {}}
      />
    );

    const moreBtn = screen.getByRole('button', { name: /More actions/i });
    await user.click(moreBtn);

    const rescheduleBtn = screen.getByRole('menuitem', { name: /Reschedule/ });
    await user.click(rescheduleBtn);
    expect(onReschedule).toHaveBeenCalled();
  });

  it('opens dropdown menu and calls onCancel', async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <AppointmentCard
        {...defaultProps}
        onReschedule={() => {}}
        onCancel={onCancel}
      />
    );

    const moreBtn = screen.getByRole('button', { name: /More actions/i });
    await user.click(moreBtn);

    const cancelBtn = screen.getByRole('menuitem', { name: /Cancel Appointment/ });
    await user.click(cancelBtn);
    expect(onCancel).toHaveBeenCalled();
  });

  it('does not show actions for completed status', () => {
    render(
      <AppointmentCard
        {...defaultProps}
        appointment={{ ...defaultProps.appointment, status: 'completed' }}
        onStatusChange={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: /More actions/i })).not.toBeInTheDocument();
  });

  it('does not show actions for cancelled status', () => {
    render(
      <AppointmentCard
        {...defaultProps}
        appointment={{ ...defaultProps.appointment, status: 'cancelled' }}
        onStatusChange={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: /More actions/i })).not.toBeInTheDocument();
  });

  it('has proper aria-label on the card', () => {
    render(<AppointmentCard {...defaultProps} />);
    expect(screen.getByRole('article')).toHaveAttribute(
      'aria-label',
      'Appointment for Sarah Johnson'
    );
  });

  it('closes dropdown when clicking outside', async () => {
    const user = userEvent.setup();
    render(
      <AppointmentCard
        {...defaultProps}
        onCancel={() => {}}
        onReschedule={() => {}}
      />
    );

    const moreBtn = screen.getByRole('button', { name: /More actions/i });
    await user.click(moreBtn);
    expect(screen.getByRole('menu')).toBeInTheDocument();

    // Click outside
    await user.click(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });
});
