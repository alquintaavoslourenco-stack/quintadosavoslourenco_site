// QUINTA DOS AVÓS LOURENÇO — cookies.js (versão simples)
(function () {
  const KEY = 'qdal-consent-v1';

  const setWaOffset = (px) =>
    document.documentElement.style.setProperty('--wa-offset', px + 'px');

  function show(banner) {
    banner.removeAttribute('hidden');
    banner.setAttribute('aria-hidden', 'false');
    // calcula altura p/ afastar botão WhatsApp do banner
    requestAnimationFrame(() => {
      const h = banner.getBoundingClientRect().height || 0;
      setWaOffset(h + 12);
    });
  }

  function hide(banner) {
    banner.setAttribute('hidden', '');
    banner.setAttribute('aria-hidden', 'true');
    setWaOffset(0);
  }

  function start() {
    const banner = document.getElementById('cookie-consent');
    const accept = document.getElementById('cookie-accept');
    // link "Saber mais" usa o href do HTML (ex: /cookies/)
    if (!banner || !accept) return;

    // já aceitou antes?
    try {
      if (localStorage.getItem(KEY) === 'true') {
        hide(banner);
        return;
      }
    } catch {}

    show(banner);

    // aceitar
    accept.addEventListener('click', () => {
      try { localStorage.setItem(KEY, 'true'); } catch {}
      hide(banner);
    }, { once: true });

    // ESC para fechar (opcional — apaga este bloco se não quiseres)
    banner.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        try { localStorage.setItem(KEY, 'true'); } catch {}
        hide(banner);
      }
    });

    // re-calcula offset em resize
    window.addEventListener('resize', () => {
      if (!banner.hasAttribute('hidden')) {
        const h = banner.getBoundingClientRect().height || 0;
        setWaOffset(h + 12);
      }
    });
  }

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
      if (b) show(b);
    },
    accepted() {
      try { return localStorage.getItem(KEY) === 'true'; } catch { return false; }
    }
  };
})();
