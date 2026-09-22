/**
 * Accessible Modal Focus Trap Utility (WCAG 2.1 AA Compliance)
 * Keeps keyboard focus inside active modal dialogs and restores focus to triggering element.
 */

export class FocusTrap {
  constructor(container) {
    this.container = container;
    this.previousActiveElement = null;
    this.handleKeyDown = this.onKeyDown.bind(this);
  }

  activate() {
    this.previousActiveElement = document.activeElement;
    this.container.addEventListener('keydown', this.handleKeyDown);

    // Focus first focusable element
    requestAnimationFrame(() => {
      const focusable = this.getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    });
  }

  deactivate() {
    this.container.removeEventListener('keydown', this.handleKeyDown);
    if (this.previousActiveElement && typeof this.previousActiveElement.focus === 'function') {
      try {
        this.previousActiveElement.focus();
      } catch {
        /* ignore */
      }
    }
  }

  getFocusableElements() {
    const selector =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(this.container.querySelectorAll(selector)).filter(
      (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0
    );
  }

  onKeyDown(e) {
    if (e.key !== 'Tab') return;

    const focusable = this.getFocusableElements();
    if (focusable.length === 0) {
      e.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }
}
