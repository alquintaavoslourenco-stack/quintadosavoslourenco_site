// js/cookies.js
(function initCookies() {
  const start = () => {
    const banner = document.getElementById('cookie-banner');
    const btn = document.getElementById('accept-cookies');
    if (!banner || !btn) return;

    // Se já aceitou, garantimos que fica oculto
    try {
      if (localStorage.getItem('cookiesAccepted') === 'true') {
        banner.classList.add('hidden');
        banner.setAttribute('hidden', '');
        // fallback extra
        banner.style.display = 'none';
        return;
      }
    } catch (e) {
      // se localStorage falhar, continua e mostra o banner
      console.warn('localStorage indisponível:', e);
    }

    // Mostrar o banner (retira o hidden e garante display)
    banner.removeAttribute('hidden');
    banner.classList.remove('hidden');
    banner.style.display = 'flex';

    // Click em Aceitar
    btn.addEventListener('click', () => {
      try { localStorage.setItem('cookiesAccepted', 'true'); } catch {}
      // esconder com transição suave + fallback
      banner.classList.add('hidden');
      banner.setAttribute('hidden', '');
      banner.style.display = 'none';
    });
  };

  // Garante que corre quer o DOM já esteja pronto ou não
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

