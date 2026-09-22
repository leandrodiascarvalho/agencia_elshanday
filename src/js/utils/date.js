/**
 * Date and Time Pure Utility Functions
 */

/**
 * Returns formatted time as HH:MM:SS
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
export function formatTimeHHMMSS(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Returns ISO date formatted as YYYY-MM-DD
 * @param {Date|string} [date=new Date()]
 * @returns {string}
 */
export function formatDateYYYYMMDD(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/**
 * Formats a date for pt-BR regional display
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDateBR(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}
