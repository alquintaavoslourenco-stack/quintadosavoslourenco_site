// QUINTA DOS AVÓS LOURENÇO — cookies.js (versão final para domínio próprio)
(function () {
  const KEY = 'qdal-consent-v1'; // chave localStorage para consentimento

  // Ajusta o offset do botão WhatsApp
  const setWaOffset = (px) => {
    document.documentElement.style.setProperty('--wa-offset', px + 'px');
  };

  // Esconde o banner
  const hide = (banner) => {
    banner.setAttribute('hidden', '');
    banner.setAttribute('aria-hidden', 'true');
    banner.setAttribute('aria-live', 'off');
    setWaOffset(0);
  };

  // Mostra o banner
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

  // Inicialização principal
  const start = () => {
    const banner = document.getElementById('cookie-consent');
    const btn = document.getElementById('cookie-accept');
    const link = document.getElementById('cookie-more');
    if (!banner || !btn) return;

    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.tabIndex = 0;

    // Verifica se já foi aceite anteriormente
    try {
      if (localStorage.getItem(KEY) === 'true') {
        hide(banner);
        return;
      }
    } catch (e) {
      // Continua mesmo sem localStorage
    }

    // Mostrar o banner
    show(banner);

    // ESC fecha/aceita
    banner.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' || ev.key === 'Esc') {
        try { localStorage.setItem(KEY, 'true'); } catch {}
        hide(banner);
        banner.dispatchEvent(new CustomEvent('cookie-accepted'));
      }
    });

    // Botão Aceitar
    btn.addEventListener('click', () => {
      try { localStorage.setItem(KEY, 'true'); } catch {}
      hide(banner);
      banner.dispatchEvent(new CustomEvent('cookie-accepted'));
    }, { once: true });

    // 🔒 Forçar o link "Saber mais" para /cookies/
    if (link) {
      const ABS_COOKIES = new URL('/cookies/', window.location.origin).href;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();
        window.location.assign(ABS_COOKIES);
      });
    }

    // Atualizar offset do WhatsApp em resize
    window.addEventListener('resize', () => {
      if (!banner.hasAttribute('hidden')) {
        const h = banner.getBoundingClientRect().height || 0;
        setWaOffset(h + 12);
      }
    });
  };

  // Aguarda DOM carregado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Helpers acessíveis no console
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
