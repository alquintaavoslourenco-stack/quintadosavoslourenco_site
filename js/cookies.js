// QUINTA DOS AVÓS LOUR ENÇO — cookies.js (navegação robusta + ESC + sem outline)
(function () {
  const KEY = 'qdal-consent-v1'; // chave única do projeto

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
    // evitar contorno azul no foco
    banner.style.outline = 'none';
  };

  // Detecta a raiz real do site (funciona em domínio custom e em GitHub Pages /repo/)
  function getSiteRoot() {
    // Tenta deduzir a partir do CSS principal
    const link = document.querySelector('link[rel="stylesheet"][href*="style.css"]');
    if (link) {
      try {
        const u = new URL(link.href, window.location.href);
        // remove "/css/style.css" e tudo o que vier depois
        return u.pathname.replace(/\/css\/style\.css.*$/i, '/') || '/';
      } catch {}
    }
    // Fallback: se existir <base>, usa-o
    if (document.baseURI) {
      try {
        const b = new URL(document.baseURI);
        return b.pathname.endsWith('/') ? b.pathname : b.pathname.replace(/[^/]+$/, '');
      } catch {}
    }
    // Último recurso: assume raiz /
    return '/';
  }

  const start = () => {
    const banner = document.getElementById('cookie-consent');
    const btn = document.getElementById('cookie-accept');
    const link = document.getElementById('cookie-more');
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
    } catch (e) { /* continua sem localStorage */ }

    // mostrar e calcular offset do WhatsApp
    show(banner);
    requestAnimationFrame(() => {
      const h = banner.getBoundingClientRect().height || 0;
      setWaOffset(h + 12);
    });

    // ESC = aceitar/fechar
    banner.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' || ev.key === 'Esc') {
        try { localStorage.setItem(KEY, 'true'); } catch {}
        hide(banner);
        banner.dispatchEvent(new CustomEvent('cookie-accepted'));
      }
    });

    // aceitar
    btn.addEventListener('click', () => {
      try { localStorage.setItem(KEY, 'true'); } catch {}
      hide(banner);
      banner.dispatchEvent(new CustomEvent('cookie-accepted'));
    }, { once: true });

    // "Saber mais" → navegação robusta para /cookies/
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const root = getSiteRoot();        // p.ex. "/" num domínio custom, ou "/repo/" em GitHub Pages de projeto
        window.location.href = root + 'cookies/';
      });
    }

    // ajustar offset do WhatsApp em resize
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

  // helpers de teste no console
  window.qdalConsent = {
    reset() {
      try { localStorage.removeItem(KEY); } catch {}
      const b = document.getElementById('cookie-consent');
      if (b) {
        // reabre e recalcula offset
        b.removeAttribute('hidden');
        b.setAttribute('aria-hidden', 'false');
        b.setAttribute('aria-live', 'polite');
        b.style.outline = 'none';
        requestAnimationFrame(() => {
          const h = b.getBoundingClientRect().height || 0;
          setWaOffset(h + 12);
        });
      }
    },
    accepted() {
      try { return localStorage.getItem(KEY) === 'true'; } catch { return false; }
    }
  };
})();
