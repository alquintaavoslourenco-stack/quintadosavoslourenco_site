/* ==========================================================
   QUINTA DOS AVÓS LOURENÇO — APP.JS
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

  /* ===================== Slider (infinito) ===================== */
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
      // índice circular (loop infinito)
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

    // pausa/resume no tab oculto
    on(document, 'visibilitychange', () => { if (document.hidden) stopAutoPlay(); else startAutoPlay(); });

    // hover/touch control
    on(slider, 'mouseenter', stopAutoPlay);
    on(slider, 'mouseleave', startAutoPlay);
    on(slider, 'touchstart', stopAutoPlay, { passive: true });
    on(slider, 'touchend',   startAutoPlay, { passive: true });

    // teclado
    on(slider, 'keydown', (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft')  showSlide(slideIndex - 1);
    });

    showSlide(0);
    startAutoPlay(); // ➜ nunca “pára no fim”; o índice é circular
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
        lightbox.focus?.();
      });
    });

    on(lightbox, 'click', (e) => { if (e.target !== lightboxImg) lightbox.style.display = 'none'; });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') lightbox.style.display = 'none'; });
  }

  /* ===================== Header overlay sobre o HERO ===================== */
  function initTopbarOverlay() {
    const topbar = qs('.topbar');
    const hero   = qs('.hero');
    const menu   = qs('.menu');
    if (!topbar || !hero) return;

    const setOverlay = (isOverlay) => {
      if (isOverlay) {
        topbar.classList.add('is-overlay');
        topbar.classList.remove('is-solid');
      } else {
        topbar.classList.remove('is-overlay');
        topbar.classList.add('is-solid');
      }
    };

    // Decide estado pelo scroll/posição do hero
    const applyByScroll = () => {
      const menuIsOpen = menu && menu.classList.contains('active');
      if (menuIsOpen) { setOverlay(false); return; }
      const rect = hero.getBoundingClientRect();
      // hero visível se parte do topo estiver no viewport
      const heroVisible = rect.bottom > 80 && rect.top < (window.innerHeight * 0.9);
      setOverlay(heroVisible);
    };

    // IntersectionObserver para suavidade
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      const menuIsOpen = menu && menu.classList.contains('active');
      if (menuIsOpen) { setOverlay(false); return; }
      setOverlay(entry.isIntersecting);
    }, { threshold: 0.1 });

    io.observe(hero);

    // Fallback inicial e em scroll
    on(window, 'load', applyByScroll, { passive:true });
    on(window, 'scroll', applyByScroll, { passive:true });

    // Reage ao evento personalizado do menu mobile
    on(document, 'menu:state', (e) => {
      const open = !!(e && e.detail && e.detail.open);
      if (open) setOverlay(false);
      else applyByScroll();
    });
  }

  /* ===================== Menu Mobile ===================== */
  function initMobileMenu() {
    const menu   = qs('.menu');
    const toggle = qs('.menu-toggle');
    if (!menu || !toggle) return;

    on(toggle, 'click', () => {
      const open = menu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '✕' : '☰';

      // notifica overlay sobre o estado do menu
      document.dispatchEvent(new CustomEvent('menu:state', { detail: { open } }));
    });

    qsa('.menu a').forEach(a => {
      on(a, 'click', () => {
        const wasOpen = menu.classList.contains('active');
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
        if (wasOpen) {
          document.dispatchEvent(new CustomEvent('menu:state', { detail: { open:false } }));
        }
      });
    });

    on(window, 'resize', () => {
      if (window.innerWidth > 768) {
        const wasOpen = menu.classList.contains('active');
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
        if (wasOpen) {
          document.dispatchEvent(new CustomEvent('menu:state', { detail: { open:false } }));
        }
      }
    });
  }

  /* ===================== Redes sociais — injeta em todas as páginas ===================== */
  function addSocialRow() {
    // evita duplicações
    if (qs('.social-row')) return;

    // cria o bloco
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

    // 1) Homepage: insere logo a seguir ao slider de testemunhos
    const slider = qs('#testemunhos .testemunhos-slider');
    if (slider) {
      slider.insertAdjacentElement('afterend', wrap);
      return;
    }

    // 2) Outras páginas: tenta dentro do main, senão no fim da última .section
    const mainContainer = qs('main.section .container') || qs('main.section');
    if (mainContainer) {
      mainContainer.appendChild(wrap);
      return;
    }

    const lastSection = qsa('.section').pop();
    if (lastSection) {
      lastSection.appendChild(wrap);
      return;
    }

    // 3) Fallback
    document.body.appendChild(wrap);
  }

  /* ===================== Boot ===================== */
  on(document, 'DOMContentLoaded', () => {
    renderTestemunhos();
    initSlider();         // loop infinito
    initLightbox();
    initMobileMenu();     // controla menu + emite "menu:state"
    initTopbarOverlay();  // torna header transparente sobre hero e sólido ao rolar
    addSocialRow();       // ícones FB/IG
  });
})();
