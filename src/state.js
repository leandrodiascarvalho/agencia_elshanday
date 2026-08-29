export const state = {
  currentTab: 'home',
  soundEnabled: false,
  isAiModalOpen: false,
  isSearchOpen: false,
  isTerminalOpen: false,
  isGameOpen: false,
  isDoomOpen: false,
  isWhatsappOpen: false,
  services: [],
  faq: [],
  repos: [],
  telemetry: null,
  activeFilter: 'all'
};

export const listeners = [];

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function setState(updates) {
  Object.assign(state, updates);
  listeners.forEach(fn => fn(state));
}
