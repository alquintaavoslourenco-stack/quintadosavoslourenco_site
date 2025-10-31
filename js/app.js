/* ==========================================================
   QUINTA DOS AVÓS LOURENÇO — APP.JS (versão final 2025)
   ========================================================== */
(() => {
  'use strict';

  /* Helpers */
  const qs  = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on  = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  /* ===================== Dados — Testemunhos ===================== */
  const TESTEMUNHOS_AIRBNB = [
    { texto: `Estadia perfeita: lugar lindo, casa impecável e anfitriões extremamente simpáticos. Levámos 5 patudos; adoraram o exterior e o A/C. Queremos voltar!`, autor: `— Laura, Airbnb (julho 2025)` },
    { texto: `Local perfeito para fugir à correria: comodidades excelentes e jardim fantástico. Animais felizes e pão quentinho no portão. Sentimo-nos em casa.`, autor: `— Tisha, Airbnb (maio 2025)` },
    { texto: `Casa incrivelmente equipada: beleza do antigo com comodidades do presente. Vista incrível. Excelente estadia.`, autor: `— Joana, Airbnb (abril 2025)` },
    { texto: `Estadia maravilhosa: casa muito limpa, rústica e acolhedora com comodidades modernas. Anfitrião sempre disponível.`, autor: `— Beatriz, Airbnb (abril 2025)` },
    { texto: `Refúgio na serra para descansar. Pequeno-almoço divinal e anfitriões 24/7. Casa ampla e exterior impecável.`, autor: `— Patrícia, Airbnb (fevereiro 2025)` },
    { texto: `Propriedade incrível: muito limpa e confortável. Cão e gato felizes. Amei o burro Uva e os porcos Elvis e Shakira.`, autor: `— Juliane, Airbnb (setembro 2025)` },
    { texto: `Anfitriões afáveis e sempre disponíveis. Casa bem equipada; exterior fantástico e cercado. Pequeno-almoço diário delicioso.`, autor: `— Diogo, Airbnb (março 2025)` }
  ];

  /* ===================== Renderiza Testemunhos ===================== */
  function renderTestemunhos() {
    const sliderEl = qs('#testemunhos .testemunhos-slider') || qs('.testemunhos-slider');
    if (!sliderEl) return;

    let dotsEl = sliderEl.querySelector('.dots');
    if (!dotsEl) {
      dotsEl = document.createElement('div');
      dotsEl.className = 'dots';
      sliderEl.appendChild(dotsEl);
    }

    if (sliderEl.querySelectorAll('.slide').length === 0) {
      TESTEMUNHOS_AIRBNB.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'slide' + (idx === 0 ? ' active' : '');
        div.innerHTML = `
          <p style="color:#FFD700; font-size:20px; margin-bottom:6px;">★★★★★</p>
          <p><em>${item.texto}</em></p>
          <p class="note">${item.autor}</p>
        `;
        sliderEl.insertBefore(div, dotsEl);
      });
    }
  }

  /* ===================== Slider infinito ===================== */
  function initSlider() {
    const slider = qs('.testemunhos-slider');
    if (!slider) return;

    const slides = qsa('.testemunhos-slider .slide');
    if (slides.length === 0) return;

    const dotsContainer = qs('.testemunhos-slider .dots');
    let dots = [];
    let slideIndex = 0;
    let autoPlay = null;

    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.setAttribute('role', 'button');
        dot.setAttribute('aria-label', `Ir para testemunho ${i + 1}`);
        on(dot, 'click', () => showSlide(i));
        dotsContainer.appendChild(dot);
      });
      dots = qsa('span', dotsContainer);
    }

    function showSlide(index) {
      slideIndex = (index + slides.length) % slides.length;
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slides[slideIndex].classList.add('active');
      if (dots[slideIndex]) dots[slideIndex].classList.add('active');
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const INTERVAL = 6000;

    const nextSlide = () => showSlide(slideIndex + 1);
    const startAutoPlay = () => { stopAutoPlay(); if (!reduceMotion) autoPlay = setInterval(nextSlide, INTERVAL); };
    const stopAutoPlay  = () => { if (autoPlay) { clearInterval(autoPlay); autoPlay = null; } };

    on(document, 'visibilitychange', () => { if (document.hidden) stopAutoPlay(); else startAutoPlay(); });
    on(slider, 'mouseenter', stopAutoPlay);
    on(slider, 'mouseleave', startAutoPlay);
    on(slider, 'touchstart', stopAutoPlay, { passive: true });
    on(slider, 'touchend',   startAutoPlay, { passive: true });
    on(slider, 'keydown', (e) => { if (e.key === 'ArrowRight') nextSlide(); if (e.key === 'ArrowLeft')  showSlide(slideIndex - 1); });

    showSlide(0);
    startAutoPlay();
  }

  /* ===================== Galeria — Lightbox ===================== */
  function initLightbox() {
    const galleryImgs = qsa('.gallery img');
    if (galleryImgs.length === 0) return;

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');

    const lightboxImg = document.createElement('img');
    lightbox.appendChild(lightboxImg);
    document.body.appendChild(lightbox);

    galleryImgs.forEach(img => {
      img.style.cursor = 'pointer';
      on(img, 'click', () => {
        lightboxImg.src = img.getAttribute('src');
        lightbox.style.display = 'flex';
      });
    });

    on(lightbox, 'click', (e) => { if (e.target !== lightboxImg) lightbox.style.display = 'none'; });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') lightbox.style.display = 'none'; });
  }

  /* ===================== Menu + Header ===================== */
  function initTopbar() {
    const topbar = qs('.topbar');
    const hero   = qs('.hero');
    const menu   = qs('.menu');
    const toggle = qs('.menu-toggle');
    if (!topbar) return;

    let lastY = window.scrollY;
    const SHOW_AT_TOP = 10;
    const DELTA = 6;

    const setOverlay = (isOverlay) => {
      if (isOverlay) {
        topbar.classList.add('is-overlay');
        topbar.classList.remove('is-solid');
      } else {
        topbar.classList.remove('is-overlay');
        topbar.classList.add('is-solid');
      }
    };

    const updateOverlay = () => {
      const menuIsOpen = menu && menu.classList.contains('active');
      if (menuIsOpen) { setOverlay(false); return; }
      const needSolid = !hero || window.scrollY > 40;
      setOverlay(!needSolid ? true : false);
    };

    const setTopbarHeight = () => {
      const h = topbar.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--topbar-h', `${h}px`);
    };

    // Mostrar transparente sobre o hero
    on(window, 'scroll', updateOverlay, { passive: true });
    on(window, 'resize', setTopbarHeight);

    // Esconder ao rolar para baixo, mostrar só no topo
    on(window, 'scroll', () => {
      const y = window.scrollY || 0;
      const dy = y - lastY;

      if (y <= SHOW_AT_TOP) {
        topbar.classList.remove('is-hidden');
      } else if (dy > DELTA) {
        topbar.classList.add('is-hidden');
      }

      lastY = y;
    }, { passive: true });

    // Menu mobile
    if (toggle && menu) {
      on(toggle, 'click', () => {
        const open = menu.classList.toggle('active');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.textContent = open ? '✕' : '☰';
        topbar.classList.toggle('menu-open', open);
        updateOverlay();
      });

      qsa('.menu a').forEach(a => {
        on(a, 'click', () => {
          menu.classList.remove('active');
          toggle.setAttribute('aria-expanded', 'false');
          toggle.textContent = '☰';
          topbar.classList.remove('menu-open');
          updateOverlay();
        });
      });
    }

    on(window, 'load', () => {
      updateOverlay();
      setTopbarHeight();
    });
  }

  /* ===================== Redes Sociais ===================== */
  function addSocialRow() {
    if (qs('.social-row')) return;
    const wrap = document.createElement('div');
    wrap.className = 'social-row';
    wrap.innerHTML = `
      <a class="social-link" href="https://www.facebook.com/QuintaDosAvosLourenco" target="_blank" rel="noopener" aria-label="Facebook">
        <svg class="icon" viewBox="0 0 24 24"><path d="M22 12.06C22 6.49 17.52 2 12 2S2 6.49 2 12.06c0 5.01 3.66 9.17 8.44 9.94v-7.03H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.62.77-1.62 1.56v1.87h2.77l-.44 2.91h-2.33V22c4.78-.77 8.44-4.93 8.44-9.94z"/></svg>
      </a>
      <a class="social-link" href="https://www.instagram.com/QuintaDosAvosLourenco" target="_blank" rel="noopener" aria-label="Instagram">
        <svg class="icon" viewBox="0 0 24 24"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.75-3a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 17.75 6.5z"/></svg>
      </a>
    `;
    const lastSection = qsa('.section').pop();
    if (lastSection) lastSection.appendChild(wrap);
    else document.body.appendChild(wrap);
  }

  /* ===================== Boot ===================== */
  on(document, 'DOMContentLoaded', () => {
    renderTestemunhos();
    initSlider();
    initLightbox();
    initTopbar();
    addSocialRow();
  });
})();
