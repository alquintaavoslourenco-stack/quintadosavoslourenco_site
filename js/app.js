/* ==========================================================
   QUINTA DOS AVÓS LOURENÇO — APP.JS
   ========================================================== */
(() => {
  'use strict';

  /* Helpers */
  const qs  = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on  = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  /* Dados — Testemunhos (podes editar/ordenar à vontade) */
  const TESTEMUNHOS_AIRBNB = [
    { texto: `Estadia perfeita: lugar lindo, casa impecável e anfitriões extremamente simpáticos. Levámos 5 patudos; adoraram o exterior e o A/C. Queremos voltar!`, autor: `— Laura, Airbnb (julho 2025)` },
    { texto: `Local perfeito para fugir à correria: comodidades excelentes e jardim fantástico. Animais felizes e pão quentinho no portão. Sentimo-nos em casa.`, autor: `— Tisha, Airbnb (maio 2025)` },
    { texto: `Casa incrivelmente equipada: beleza do antigo com comodidades do presente. Vista incrível. Excelente estadia.`, autor: `— Joana, Airbnb (abril 2025)` },
    { texto: `Estadia maravilhosa: casa muito limpa, rústica e acolhedora com comodidades modernas. Anfitrião sempre disponível.`, autor: `— Beatriz, Airbnb (abril 2025)` },
    { texto: `Refúgio na serra para descansar. Pequeno-almoço divinal e anfitriões 24/7. Casa ampla e exterior impecável.`, autor: `— Patrícia, Airbnb (fevereiro 2025)` },
    { texto: `Propriedade incrível: muito limpa e confortável. Cão e gato felizes. Amei o burro Uva e os porcos Elvis e Shakira.`, autor: `— Juliane, Airbnb (setembro 2025)` },
    { texto: `Anfitriões afáveis e sempre disponíveis. Casa bem equipada; exterior fantástico e cercado. Pequeno-almoço diário delicioso.`, autor: `— Diogo, Airbnb (março 2025)` }
  ];

  /* Renderiza Testemunhos */
  function renderTestemunhos() {
    const sliderEl = qs('#testemunhos .testemunhos-slider') || qs('.testemunhos-slider');
    if (!sliderEl) return;

    // cria .dots se não existir
    let dotsEl = sliderEl.querySelector('.dots');
    if (!dotsEl) {
      dotsEl = document.createElement('div');
      dotsEl.className = 'dots';
      sliderEl.appendChild(dotsEl);
    }

    // evita duplicar slides
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

  /* Slider */
  function initSlider() {
    const slider = qs('.testemunhos-slider');
    if (!slider) return;

    const slides = qsa('.testemunhos-slider .slide');
    if (slides.length === 0) return;

    const dotsContainer = qs('.testemunhos-slider .dots');
    let dots = [];
    let slideIndex = 0;
    let autoPlay = null;

    // (Re)cria pontos
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
      slides.forEach(s => s.classList.remove('active'));
      dots.forEach(d => d.classList.remove('active'));
      slideIndex = (index + slides.length) % slides.length;
      slides[slideIndex].classList.add('active');
      if (dots[slideIndex]) dots[slideIndex].classList.add('active');
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const INTERVAL = 6000;

    function nextSlide() { showSlide(slideIndex + 1); }
    function startAutoPlay() { stopAutoPlay(); if (!reduceMotion) autoPlay = setInterval(nextSlide, INTERVAL); }
    function stopAutoPlay() { if (autoPlay) { clearInterval(autoPlay); autoPlay = null; } }

    // pausa autoplay quando tab fica oculto
    on(document, 'visibilitychange', () => { if (document.hidden) stopAutoPlay(); else startAutoPlay(); });

    // hover/touch control
    on(slider, 'mouseenter', stopAutoPlay);
    on(slider, 'mouseleave', startAutoPlay);
    on(slider, 'touchstart', stopAutoPlay, { passive: true });
    on(slider, 'touchend', startAutoPlay,   { passive: true });

    // teclado
    on(slider, 'keydown', (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft')  showSlide(slideIndex - 1);
    });

    showSlide(0);
    startAutoPlay();
  }

  /* Galeria — Lightbox */
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
        lightbox.focus?.();
      });
    });

    on(lightbox, 'click', (e) => { if (e.target !== lightboxImg) lightbox.style.display = 'none'; });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') lightbox.style.display = 'none'; });
  }

  /* Menu Mobile */
  function initMobileMenu() {
    const menu   = qs('.menu');
    const toggle = qs('.menu-toggle');
    if (!menu || !toggle) return;

    on(toggle, 'click', () => {
      const open = menu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '✕' : '☰';
    });

    qsa('.menu a').forEach(a => {
      on(a, 'click', () => {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      });
    });

    on(window, 'resize', () => {
      if (window.innerWidth > 768) {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      }
    });
  }

  /* Redes sociais — injeta o bloco em todas as páginas (evita duplicações) */
  function addSocialRow() {
    const target = qs('main.section .container') || qs('main.section');
    if (!target || qs('.social-row')) return; // já existe

    const wrap = document.createElement('div');
    wrap.className = 'social-row';
    wrap.setAttribute('aria-label', 'Siga-nos nas redes sociais');
    wrap.innerHTML = `
      <a class="social-link" href="https://www.facebook.com/QuintaDosAvosLourenco" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22 12.06C22 6.49 17.52 2 12 2S2 6.49 2 12.06c0 5.01 3.66 9.17 8.44 9.94v-7.03H7.9v-2.91h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.62.77-1.62 1.56v1.87h2.77l-.44 2.91h-2.33V22c4.78-.77 8.44-4.93 8.44-9.94z"/>
        </svg>
      </a>
      <a class="social-link" href="https://www.instagram.com/QuintaDosAvosLourenco" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.75-3a1.25 1.25 0 1 1-1.25 1.25A1.25 1.25 0 0 1 17.75 6.5z"/>
        </svg>
      </a>
    `;
    target.appendChild(wrap);
  }

  /* Boot */
  on(document, 'DOMContentLoaded', () => {
    renderTestemunhos();
    initSlider();
    initLightbox();
    initMobileMenu();
    addSocialRow(); // <- injeta os ícones FB/IG
  });
})();

