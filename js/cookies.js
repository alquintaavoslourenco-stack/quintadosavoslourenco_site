// QUINTA DOS AVÓS LOURENÇO — cookies.js (força /cookies/ no "Saber mais")
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

  // URL absoluto para a página de cookies (domínio próprio)
  const ABS_COOKIES = window.location.origin + '/cookies/';

  // Substitui o link por um novo nó (remove listeners antigos que possam redirecionar)
  function replaceCookieLink() {
    const oldLink = document.getElementById('cookie-more');
    if (!oldLink) return null;

    const newLink = document.createElement('a');
    newLink.id = 'cookie-more';
    newLink.href = ABS_COOKIES;           // URL absoluto
    newLink.rel = 'nofollow noopener';
    newLink.textContent = oldLink.textContent || 'Saber mais';

    // Força a navegação e bloqueia outros handlers
    newLink.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      window.location.assign(ABS_COOKIES);
    });

    oldLink.replaceWith(newLink);
    return newLink;
  }

  // Captura cliques no "Saber mais" ANTES de qualquer outro script (fase de captura)
  document.addEventListener('click', (e) => {
    const target = e.target && (e.target.closest ? e.target.closest('#cookie-more') : null);
    if (target) {
      e.preventDefault();
      e.stopPropagation();
      if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
      window.location.assign(ABS_COOKIES);
    }
  }, true); // <- capture = true

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
    replaceCookieLink(); // garante link limpo

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

  // Helpers
  window.qdalConsent = {
    reset() {
      try { localStorage.removeItem(KEY); } catch {}
      const b = document.getElementById('cookie-consent');
      if (b) show(b);
      replaceCookieLink();
    },
    accepted() {
      try { return localStorage.getItem(KEY) === 'true'; } catch { return false; }
    }
  };
})();
