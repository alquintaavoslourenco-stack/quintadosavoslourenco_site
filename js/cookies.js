// QUINTA DOS AVÓS LOURENÇO — cookies.js (domínio próprio)
(function () {
  const KEY = 'qdal-consent-v1';

  const setWaOffset = (px) => {
    document.documentElement.style.setProperty('--wa-offset', px + 'px');
  };

  const hide = (banner) => {
    banner.setAttribute('hidden', '');
    banner.setAttribute('aria-hidden', 'true');
    banner.setAttribute('aria-live', 'off');
    setWaOffset(0);
  };

  const show = (banner) => {
    banner.removeAttribute('hidden');
    banner.setAttribute('aria-hidden', 'false');
    banner.setAttribute('aria-live', 'polite');
    banner.style.outline = 'none'; // sem contorno azul
    requestAnimationFrame(() => {
      const h = banner.getBoundingClientRect().height || 0;
      setWaOffset(h + 12);
    });
  };

  const start = () => {
    const banner = document.getElementById('cookie-consent');
    const btn = document.getElementById('cookie-accept');
    if (!banner || !btn) return;

    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.tabIndex = 0;

    try {
      if (localStorage.getItem(KEY) === 'true') {
        hide(banner);
        return;
      }
    } catch {}

    show(banner);

    // ESC aceita/fecha
    banner.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' || ev.key === 'Esc') {
        try { localStorage.setItem(KEY, 'true'); } catch {}
        hide(banner);
        banner.dispatchEvent(new CustomEvent('cookie-accepted'));
      }
    });

    // Aceitar
    btn.addEventListener('click', () => {
      try { localStorage.setItem(KEY, 'true'); } catch {}
      hide(banner);
      banner.dispatchEvent(new CustomEvent('cookie-accepted'));
    }, { once: true });

    // Ajustar offset em resize
    window.addEventListener('resize', () => {
      if (!banner.hasAttribute('hidden')) {
        const h = banner.getBoundingClientRect().height || 0;
        setWaOffset(h + 12);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // helpers
  window.qdalConsent = {
    reset() {
      try { localStorage.removeItem(KEY); } catch {}
      const b = document.getElementById('cookie-consent');
      if (b) show(b);
    },
    accepted() {
      try { return localStorage.getItem(KEY) === 'true'; } catch { return false; }
    }
  };
})();

