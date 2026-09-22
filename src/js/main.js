import '../styles/tailwind.css';
import '../styles/main.scss';
import { App } from './core/app.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  window.__EL_SHANDAY_APP__ = app;

  // Register PWA Service Worker in production / supported environments
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log(
            '[EL SHANDAY PWA]: Service Worker registrado com sucesso no escopo:',
            reg.scope
          );
        })
        .catch((err) => {
          console.log('[EL SHANDAY PWA]: Registro de Service Worker indisponível:', err.message);
        });
    });
  }
});
