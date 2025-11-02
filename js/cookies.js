// QUINTA DOS AVÓS LOURENÇO — cookies.js (versão final corrigida)
(function () {
  const KEY = 'qdal-consent-v1'; // chave única do projeto

  const setWaOffset = (px) => {
    document.documentElement.style.setProperty('--wa-offset', px + 'px');
  };

  const hide = (banner) => {
    banner.setAttribute('hidden', '');
    banner.setAttribute('aria-hidden', 'true');
    banner.setAttribute('aria-live', 'off');
    banner.setAttribute('tabindex', '-1');
    setWaOffset(0);
  };

  const show = (banner) => {
    banner.removeAttribute('hidden');
    banner.setAttribute('aria-hidden', 'false');
    banner.setAttribute('aria-live', 'polite');
    banner.focus();

    // mede a altura do banner e ajusta o WhatsApp
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

    // acessibilidade
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('tabindex', '0');

    // se já aceitou, esconder
    try {
      if (localStorage.getItem(KEY) === 'true') {
        hide(banner);
        return;
      }
    } catch (e) { /* ignora erros de localStorage */ }

    // mostrar banner
    show(banner);

    // aceitar cookies
    btn.addEventListener('click', () => {
      try { localStorage.setItem(KEY, 'true'); } catch {}
      hide(banner);
      banner.dispatchEvent(new CustomEvent('cookie-accepted'));
    }, { once: true });

    // link “Saber mais” → abre página de cookies
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = '/cookies/';
      });
    }

    // ajustar offset do WhatsApp ao redimensionar
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
      if (b) show(b);
    },
    accepted() {
      try { return localStorage.getItem(KEY) === 'true'; } catch { return false; }
    }
  };
})();
