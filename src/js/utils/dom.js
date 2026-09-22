export const $ = (selector, parent = document) => parent.querySelector(selector);
export const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

export function createElement(tag, className = '', innerHTML = '', attributes = {}) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (innerHTML) el.innerHTML = innerHTML;
  Object.entries(attributes).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

export function on(element, event, handler) {
  if (element) {
    element.addEventListener(event, handler);
  }
}

/**
 * Escapes untrusted strings for safe interpolation into HTML templates.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
