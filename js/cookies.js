// QUINTA DOS AVÓS LOURENÇO — cookies.js (final fix /cookies/)
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
    banner.style.outline = 'none';
    requestAnimationFrame(() => {
      const h = banner.getBoundingClientRect().height || 0;
      setWaOffset(h + 12);
    });
  };

  const ABS_COOKIES = `${window.location.origin}/cookies/`;

  // Cria ou substitui o link Saber mais (sem listeners herdados)
  function ensureCookieLink() {
    const existing = document.getElementById('cookie-more');
    if (!existing) return;
    const cleanLink = existing.cloneNode(true);
    cleanLink.href = ABS_COOKIES;
    cleanLink.rel = 'nofollow noopener';
    cleanLink.removeAttribute('onclick');
    cleanLink.addEventListener('click', (ev) => {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      window.location.href = ABS_COOKIES;
    });
    existing.replaceWith(cleanLink);
  }

  // Captura qualquer clique no Saber mais (fase de captura)
  document.addEventListener(
    'click',
    (e) => {
      const a = e.target.closest?.('#cookie-more');
      if (a) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.location.href = ABS_COOKIES;
      }
    },
    true
  );

  const start = () => {
    const banner = document.getElementById('cookie-consent');
    const btn = document.getElementById('cookie-accept');
    if (!banner || !btn) return;

    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.tabIndex = 0;

    // já aceitou?
    try {
      if (localStorage.getItem(KEY) === 'true') {
        hide(banner);
        return;
      }
    } catch {}

    show(banner);
    ensureCookieLink();

    // ESC aceita/fecha
    banner.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' || ev.key === 'Esc') {
        try {
          localStorage.setItem(KEY, 'true');
        } catch {}
        hide(banner);
      }
    });

    // Botão aceitar
    btn.addEventListener(
      'click',
      () => {
        try {
          localStorage.setItem(KEY, 'true');
        } catch {}
        hide(banner);
      },
      { once: true }
    );

    // Ajusta offset em resize
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

  // Helpers no console
  window.qdalConsent = {
    reset() {
      try {
        localStorage.removeItem(KEY);
      } catch {}
      const b = document.getElementById('cookie-consent');
      if (b) show(b);
      ensureCookieLink();
    },
    accepted() {
      try {
        return localStorage.getItem(KEY) === 'true';
      } catch {
        return false;
      }
    },
  };
})();
