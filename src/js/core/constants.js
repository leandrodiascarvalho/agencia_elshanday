/**
 * Application Constants
 * Eliminates magic strings, numbers, and provides a single source of truth.
 */

export const STORAGE_KEYS = Object.freeze({
  SOUND: 'elshanday_sound_enabled',
  CRT: 'elshanday_crt_enabled',
  THEME: 'elshanday_theme',
  BRIEFING_DRAFT: 'elshanday_briefing_draft',
});

export const APP_THEMES = Object.freeze([
  { id: 'pixel-green', label: '8-Bit Green' },
  { id: 'amber', label: 'Amber Phosphor' },
  { id: 'synthwave', label: 'Synthwave Neon' },
  { id: 'light', label: 'Light Mode' },
]);

export const DEFAULT_THEME = 'pixel-green';

export const NAVIGATION_TABS = Object.freeze({
  HOME: 'home',
  SERVICES: 'services',
  PORTFOLIO: 'portfolio',
  BRIEFING: 'briefing',
  FAQ: 'faq',
  CONSOLE: 'console',
});

export const CONTACT_INFO = Object.freeze({
  WHATSAPP_NUMBER: '5511999999999',
  EMAIL: 'contato@elshanday.dev',
  CANONICAL_URL: 'https://elshanday.dev/',
});
