// QUINTA DOS AVÓS LOURENÇO — cookies.js
(function () {
  const KEY = 'qdal-consent-v1'; // chave única do projeto

  const setWaOffset = (px) => {
    document.documentElement.style.setProperty('--wa-offset', px + 'px');
  };

  const hide = (banner) => {
    banner.setAttribute('hidden', '');
    banner.setAttribute('aria-hidden', 'true');
    setWaOffset(0); // volta o WhatsApp ao fundo
  };

  const show = (banner) => {
    banner.removeAttribute('hidden');
    banner.setAttribute('aria-hidden', 'false');
    // mede a altura do banner e ajusta o WhatsApp
    requestAnimationFrame(() => {
      const h = banner.getBoundingClientRect().height || 0;
      setWaOffset(h + 12); // 12px de folga
    });
  };

  const start = () => {
    const banner = document.getElementById('cookie-consent');
    const btn = document.getElementById('cookie-accept');
    if (!banner || !btn) return;

    // Já aceitou?
    try {
      if (localStorage.getItem(KEY) === 'true') {
        hide(banner);
        return;
      }
    } catch (e) { /* continua mesmo sem localStorage */ }

    // Mostrar banner
    show(banner);

    // Aceitar (uma vez)
    btn.addEventListener('click', () => {
      try { localStorage.setItem(KEY, 'true'); } catch {}
      hide(banner);
    }, { once: true });

    // Acessibilidade: ESC fecha/aceita
    banner.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        try { localStorage.setItem(KEY, 'true'); } catch {}
        hide(banner);
      }
    });

    // Atualiza offset em resize
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

  // Helpers de teste no console
  window.qdalConsent = {
    reset() { try { localStorage.removeItem(KEY); } catch {} const b = document.getElementById('cookie-consent'); if (b) show(b); },
    accepted() { try { return localStorage.getItem(KEY) === 'true'; } catch { return false; } }
  };
})();
