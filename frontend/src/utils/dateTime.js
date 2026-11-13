// Reusable Date & Time utilities using Asia/Kolkata timezone

/**
 * Get current business Date in YYYY-MM-DD in Asia/Kolkata timezone
 */
export const getKolkataDateString = (dateObj = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(dateObj); // Returns YYYY-MM-DD
};

/**
 * Format a YYYY-MM-DD string into readable Indian format, e.g. "Friday, 13 November 2026"
 */
export const formatReadableDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  }).format(date);
};

/**
 * Format short date, e.g. "13 Nov 2026"
 */
export const formatShortDate = (dateString) => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata'
  }).format(date);
};

/**
 * Get time greeting based on Asia/Kolkata hour
 */
export const getKolkataGreeting = () => {
  const kolkataTimeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    hour12: false
  }).format(new Date());

  const hour = parseInt(kolkataTimeStr, 10);
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

/**
 * Get current live time formatted e.g. "11:15 AM"
 */
export const getKolkataLiveTime = () => {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(new Date());
};

