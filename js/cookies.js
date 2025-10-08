// js/cookies.js
document.addEventListener('DOMContentLoaded', () => {
  const banner = document.getElementById('cookie-banner');
  const btn = document.getElementById('accept-cookies');
  if (!banner || !btn) return;

  // Se já aceitou, o banner continua oculto
  if (localStorage.getItem('cookiesAccepted') === 'true') return;

  // Caso contrário, mostramos o banner
  banner.removeAttribute('hidden');

  btn.addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', 'true');
    banner.setAttribute('hidden', ''); // volta a ocultar sem flash
  });
});
