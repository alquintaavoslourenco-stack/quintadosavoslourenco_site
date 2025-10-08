// js/cookies.js
document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;

  const btn = document.getElementById('accept-cookies');

  // Se já aceitou antes, não mostra o banner
  if (localStorage.getItem('cookiesAccepted') === 'true') {
    banner.remove();
    return;
  }

  // Ao clicar, guarda aceitação e remove o banner
  btn?.addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', 'true');
    banner.remove();
  });
});
