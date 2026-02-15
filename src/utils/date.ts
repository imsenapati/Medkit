/**
 * Calculate age in years from a date of birth.
 * @param dob - Date of birth
 * @param referenceDate - Date to calculate age from (defaults to now)
 * @returns Age in years
 */
export function calculateAge(dob: Date, referenceDate: Date = new Date()): number {
  const ageDiffMs = referenceDate.getTime() - dob.getTime();
  const ageDate = new Date(ageDiffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

/**
 * Format a Date to a time string (e.g., "2:30 PM").
 */
export function formatTime(date: Date, timezone?: string): string {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  if (timezone) {
    options.timeZone = timezone;
  }
  return date.toLocaleTimeString('en-US', options);
}

/**
 * Format a Date to a date string (e.g., "Jan 15, 2024").
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format a duration in minutes to a human-readable string.
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
