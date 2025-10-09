// js/cookies.js
(function initCookies() {
  const start = () => {
    const banner = document.getElementById('cookie-consent');   // <-- id certo
    const btn = document.getElementById('cookie-accept');       // <-- id certo
    if (!banner || !btn) return;

    // Se já aceitou, esconder e sair
    try {
      if (localStorage.getItem('cookiesAccepted') === 'true') {
        banner.setAttribute('hidden', '');
        banner.style.display = 'none';
        return;
      }
    } catch (e) {
      console.warn('localStorage indisponível:', e);
    }

    // Mostrar o banner
    banner.removeAttribute('hidden');
    banner.style.display = 'block';

    // Click em Aceitar
    btn.addEventListener('click', () => {
      try { localStorage.setItem('cookiesAccepted', 'true'); } catch {}
      banner.setAttribute('hidden', '');
      banner.style.display = 'none';
    });

    // Opcional: fechar com ESC
    banner.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        try { localStorage.setItem('cookiesAccepted', 'true'); } catch {}
        banner.setAttribute('hidden', '');
        banner.style.display = 'none';
      }
    });
  };

  // Garante que corre mesmo que o DOM ainda esteja a carregar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

