// QUINTA DOS AVÓS LOURENÇO — cookies.js (versão final afinada)
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

    // evita contorno azul (outline) no foco automático
    banner.style.outline = 'none';

    // mede altura do banner e ajusta botão WhatsApp
    requestAnimationFrame(() => {
      const h = banner.getBoundingClientRect().height || 0;
      setWaOffset(h + 12);
    });
  };

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

    show(banner);

    // aceitar cookies
    btn.addEventListener('click', () => {
      try { localStorage.setItem(KEY, 'true'); } catch {}
      hide(banner);
      banner.dispatchEvent(new CustomEvent('cookie-accepted'));
    }, { once: true });

    // tecla ESC fecha/aceita
    banner.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' || ev.key === 'Esc') {
        try { localStorage.setItem(KEY, 'true'); } catch {}
        hide(banner);
        banner.dispatchEvent(new CustomEvent('cookie-accepted'));
      }
    });

   // link “Saber mais” → página de cookies
if (link) {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = window.location.origin + '/cookies/index.html';
  });
}

    // ajustar offset do WhatsApp
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
        show(b);
      }
    },
    accepted() {
      try { return localStorage.getItem(KEY) === 'true'; } catch { return false; }
    }
  };
})();
