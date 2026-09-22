import { STORAGE_KEYS, DEFAULT_THEME } from './constants.js';

/**
 * Global reactive state store with localStorage synchronization and subscription pattern.
 */

const initialSound = (() => {
  try {
    return localStorage.getItem(STORAGE_KEYS.SOUND) === 'true';
  } catch {
    return false;
  }
})();

const initialCrt = (() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CRT);
    return saved !== null ? saved === 'true' : true;
  } catch {
    return true;
  }
})();

const initialTheme = (() => {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
})();

export const state = {
  currentTab: 'home',
  soundEnabled: initialSound,
  crtEnabled: initialCrt,
  theme: initialTheme,
  services: [],
  faq: [],
  repos: [],
  telemetry: null,
  activeFilter: 'all',
  cartridgeScore: 999990,
  activeModal: null,
};

export const listeners = new Set();

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setState(updates) {
  const previousState = { ...state };
  Object.assign(state, updates);

  // Sync persistent properties
  if (updates.soundEnabled !== undefined) {
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND, String(state.soundEnabled));
    } catch {
      /* ignore */
    }
  }

  if (updates.crtEnabled !== undefined) {
    try {
      localStorage.setItem(STORAGE_KEYS.CRT, String(state.crtEnabled));
    } catch {
      /* ignore */
    }
  }

  if (updates.theme !== undefined) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
    } catch {
      /* ignore */
    }
  }

  listeners.forEach((fn) => {
    try {
      fn(state, previousState);
    } catch (err) {
      console.error('[STATE LISTENER ERROR]:', err);
    }
  });
}
