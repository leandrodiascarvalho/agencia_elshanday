import './style.css';
import './main.scss';
import { App } from './src/app.js';

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  window.__EL_SHANDAY_APP__ = app;
});
