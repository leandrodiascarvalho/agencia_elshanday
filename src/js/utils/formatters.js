/**
 * Clean Code Formatting Utilities
 */

const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/**
 * Formats a number to Brazilian Real (BRL) currency format.
 * @param {number} amount
 * @returns {string} e.g. "R$ 2.500"
 */
export function formatCurrencyBRL(amount) {
  const numericAmount = Number(amount) || 0;
  return BRL_FORMATTER.format(numericAmount);
}

/**
 * Formats an integer with thousands separator.
 * @param {number} value
 * @returns {string} e.g. "999.990"
 */
export function formatInteger(value) {
  return Number(value || 0).toLocaleString('pt-BR');
}
