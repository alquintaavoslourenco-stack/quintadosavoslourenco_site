/* ==========================================================
   QUINTA DOS AVÓS LOURENÇO — APP.JS (versão final completa)
   ========================================================== */
(() => {
  'use strict';

  /* ======== Helpers ======== */
  const qs  = (sel, root=document) => root.querySelector(sel);
  const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const on  = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  /* ===================== DADOS — TESTEMUNHOS ===================== */
  const TESTEMUNHOS_AIRBNB = [
    { texto: `Estadia perfeita: lugar lindo, casa impecável e anfitriões extremamente simpáticos. Levámos 5 patudos; adoraram o exterior e o A/C. Queremos voltar!`, autor: `— Laura, Airbnb (julho 2025)` },
    { texto: `Local perfeito para fugir à correria: comodidades excelentes e jardim fantástico. Animais felizes e pão quentinho no portão. Sentimo-nos em casa.`, autor: `— Tisha, Airbnb (maio 2025)` },
    { texto: `Casa incrivelmente equipada: beleza do antigo com comodidades do presente. Vista incrível. Excelente estadia.`, autor: `— Joana, Airbnb (abril 2025)` },
    { texto: `Estadia maravilhosa: casa muito limpa, rústica e acolhedora com comodidades modernas. Anfitrião sempre disponível.`, autor: `— Beatriz, Airbnb (abril 2025)` },
    { texto: `Refúgio na serra para descansar. Pequeno-almoço divinal e anfitriões 24/7. Casa ampla e exterior impecável.`, autor: `— Patrícia, Airbnb (fevereiro 2025)` },
    { texto: `Propriedade incrível: muito limpa e confortável. Cão e gato felizes. Amei o burro Uva e os porcos Elvis e Shakira.`, autor: `— Juliane, Airbnb (setembro 2025)` },
    { texto: `Anfitriões afáveis e sempre disponíveis. Casa bem equipada; exterior fantástico e cercado. Pequeno-almoço diário delicioso.`, autor: `— Diogo, Airbnb (março 2025)` }
  ];

  /* ===================== RENDERIZA TESTEMUNHOS ===================== */
  function renderTestemunhos() {
    const sliderEl = qs('.testemunhos-slider');
    if (!sliderEl) return;

    // Cria slides se não existirem
    if (!sliderEl.querySelector('.slide')) {
      TESTEMUNHOS_AIRBNB.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'slide' + (idx === 0 ? ' active' : '');
        div.innerHTML = `
          <p style="color:#FFD700; font-size:20px; margin-bottom:6px;">★★★★★</p>
          <p><em>${item.texto}</em></p>
          <p class="note">${item.autor}</p>
        `;
        sliderEl.appendChild(div);
      });
    }

    // Cria bolinhas (dots)
    let dotsEl = sliderEl.querySelector('.dots');
    if (!dotsEl) {
      dotsEl = document.createElement('div');
      dotsEl.className = 'dots';
      TESTEMUNHOS_AIRBNB.forEach(() => {
        const dot = document.createElement('span');
        dotsEl.appendChild(dot);
      });
      sliderEl.appendChild(dotsEl);
    }
  }

  /* ===================== SLIDER (testemunhos) ===================== */
  function initSlider() {
    const slider = qs('.testemunhos-slider');
    if (!slider) return;

    const slides = qsa('.slide', slider);
    const dots = qsa('.dots span', slider);
    if (!slides.length || !dots.length) return;

    let i = 0;
    const show = (n) => {
      i = (n + slides.length) % slides.length;
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[i].classList.add('active');
      if (dots[i]) dots[i].classList.add('active');
    };

    dots.forEach((d, idx) => on(d, 'click', () => show(idx)));

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const INTERVAL = 6000;
    let timer = null;
    const start = () => { stop(); if (!reduceMotion) timer = setInterval(() => show(i + 1), INTERVAL); };
    const stop = () => { if (timer) clearInterval(timer); };

    on(document, 'visibilitychange', () => { if (document.hidden) stop(); else start(); });
    on(slider, 'mouseenter', stop);
    on(slider, 'mouseleave', start);
    on(slider, 'touchstart', stop, { passive: true });
    on(slider, 'touchend', start, { passive: true });
    on(slider, 'keydown', e => { if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); });

    show(0);
    start();
  }

  /* ===================== GALERIA — LIGHTBOX ===================== */
  function initLightbox() {
    const imgs = qsa('.gallery img');
    if (!imgs.length) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    const lightImg = document.createElement('img');
    lightbox.appendChild(lightImg);
    document.body.appendChild(lightbox);

    imgs.forEach(img => {
      on(img, 'click', () => {
        lightImg.src = img.src;
        lightbox.style.display = 'flex';
      });
    });
    on(lightbox, 'click', (e) => { if (e.target !== lightImg) lightbox.style.display = 'none'; });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') lightbox.style.display = 'none'; });
  }

  /* ===================== MENU MOBILE ===================== */
  function initMobileMenu(updateOverlayCb) {
    const menu = qs('.menu');
    const toggle = qs('.menu-toggle');
    const topbar = qs('.topbar');
    if (!menu || !toggle || !topbar) return;

    on(toggle, 'click', () => {
      const open = menu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '✕' : '☰';
      topbar.classList.toggle('menu-open', open);
      if (typeof updateOverlayCb === 'function') updateOverlayCb();
    });

    qsa('.menu a').forEach(a => on(a, 'click', () => {
      const wasOpen = menu.classList.contains('active');
      menu.classList.remove('active');
      toggle.textContent = '☰';
      topbar.classList.remove('menu-open');
      if (wasOpen && typeof updateOverlayCb === 'function') updateOverlayCb();
    }));
  }

  /* ===================== HEADER — FIXO E ESCONDER ===================== */
  function initTopbar() {
    const topbar = qs('.topbar');
    const hero = qs('.hero');
    const menu = qs('.menu');
    if (!topbar) return;

    let lastY = window.scrollY;
    const SHOW_AT_TOP = 10;
    const DELTA = 6;
    const HIDE_MS = 250;
    let hideTimer = null;

    function setOverlay(isOverlay) {
      if (isOverlay) { topbar.classList.add('is-overlay'); topbar.classList.remove('is-solid'); }
      else { topbar.classList.remove('is-overlay'); topbar.classList.add('is-solid'); }
    }

    function heroVisible() {
      if (!hero) return false;
      const rect = hero.getBoundingClientRect();
      return rect.bottom > 60 && rect.top < window.innerHeight * 0.9;
    }

    function updateOverlay() {
      const menuOpen = menu?.classList.contains('active');
      if (menuOpen) return setOverlay(false);
      const isHiding = topbar.classList.contains('is-hidden') || topbar.classList.contains('is-hiding');
      const nearHero = heroVisible();
      if (isHiding && nearHero) return setOverlay(true);
      const needSolid = !hero || (window.scrollY > 40 && !nearHero);
      setOverlay(!needSolid);
    }

    function onScroll() {
      const y = window.scrollY;
      const dy = y - lastY;

      if (y <= SHOW_AT_TOP) {
        topbar.classList.remove('is-hidden', 'is-hiding');
        if (hideTimer) clearTimeout(hideTimer);
      } else if (dy > DELTA && !topbar.classList.contains('is-hidden')) {
        topbar.classList.add('is-hiding', 'is-hidden');
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => topbar.classList.remove('is-hiding'), HIDE_MS);
      }
      lastY = y;
      updateOverlay();
    }

    on(window, 'scroll', onScroll, { passive: true });
    on(window, 'resize', updateOverlay);
    on(window, 'load', updateOverlay);

    initMobileMenu(updateOverlay);
  }

  /* ===================== REDES SOCIAIS (Footer) ===================== */
  function addSocialRow() {
    if (qs('.social-row')) return;
    const wrap = document.createElement('div');
    wrap.className = 'social-row';
    wrap.innerHTML = `
      <a class="social-link" href="https://www.facebook.com/QuintaDosAvosLourenco" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
        <svg class="icon" viewBox="0 0 24 24"><path d="M22 12.06C22 6.49 17.52 2 12 2S2 6.49 2 12.06c0 5.01 3.66 9.17 8.44 9.94v-7.03H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.62.77-1.62 1.56v1.87h2.77l-.44 2.91h-2.33V22c4.78-.77 8.44-4.93 8.44-9.94z"/></svg>
      </a>
      <a class="social-link" href="https://www.instagram.com/QuintaDosAvosLourenco" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <svg class="icon" viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3.5A5.5 5.5 0 116.5 13 5.5 5.5 0 0112 7.5zm0 2A3.5 3.5 0 1015.5 13 3.5 3.5 0 0012 9.5zm5.75-3a1.25 1.25 0 11-1.25 1.25A1.25 1.25 0 0117.75 6.5z"/></svg>
      </a>`;
    const footer = qs('.footer') || document.body;
    footer.appendChild(wrap);
  }

  /* ===================== BOOT ===================== */
  on(document, 'DOMContentLoaded', () => {
    renderTestemunhos();
    initSlider();
    initLightbox();
    initTopbar();
    addSocialRow();
  });
})();
