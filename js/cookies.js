// js/cookies.js
(function () {
  const KEY = 'qdal-consent-v1'; // muda se quiseres isolar por projeto

  const hide = (banner) => {
    banner.setAttribute('hidden', '');
    banner.setAttribute('aria-hidden', 'true');
  };

  const show = (banner) => {
    banner.removeAttribute('hidden');
    banner.setAttribute('aria-hidden', 'false');
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

    // Foco no botão ao abrir (não faz scroll)
    setTimeout(() => { try { btn.focus({ preventScroll: true }); } catch {} }, 0);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Helpers de teste no console:
  window.qdalConsent = {
    reset() {
      try { localStorage.removeItem(KEY); } catch {}
      const b = document.getElementById('cookie-consent');
      if (b) show(b);
    }
