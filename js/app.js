/* ==========================================================
   QUINTA DOS AVÓS LOURENÇO — APP.JS (versão final)
   ========================================================== */
(function () {
  'use strict';

  /* Helpers */
  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts || false); }

  /* ===================== DADOS — TESTEMUNHOS ===================== */
  var TESTEMUNHOS_AIRBNB = [
    { texto: "Estadia perfeita: lugar lindo, casa impecável e anfitriões extremamente simpáticos. Levámos 5 patudos; adoraram o exterior e o A/C. Queremos voltar!", autor: "— Laura, Airbnb (julho 2025)" },
    { texto: "Local perfeito para fugir à correria: comodidades excelentes e jardim fantástico. Animais felizes e pão quentinho no portão. Sentimo-nos em casa.", autor: "— Tisha, Airbnb (maio 2025)" },
    { texto: "Casa incrivelmente equipada: beleza do antigo com comodidades do presente. Vista incrível. Excelente estadia.", autor: "— Joana, Airbnb (abril 2025)" },
    { texto: "Estadia maravilhosa: casa muito limpa, rústica e acolhedora com comodidades modernas. Anfitrião sempre disponível.", autor: "— Beatriz, Airbnb (abril 2025)" },
    { texto: "Refúgio na serra para descansar. Pequeno-almoço divinal e anfitriões 24/7. Casa ampla e exterior impecável.", autor: "— Patrícia, Airbnb (fevereiro 2025)" },
    { texto: "Propriedade incrível: muito limpa e confortável. Cão e gato felizes. Amei o burro Uva e os porcos Elvis e Shakira.", autor: "— Juliane, Airbnb (setembro 2025)" },
    { texto: "Anfitriões afáveis e sempre disponíveis. Casa bem equipada; exterior fantástico e cercado. Pequeno-almoço diário delicioso.", autor: "— Diogo, Airbnb (março 2025)" }
  ];

  /* ===================== RENDER — TESTEMUNHOS ===================== */
  function renderTestemunhos() {
    var sliderEl = qs('#testemunhos .testemunhos-slider') || qs('.testemunhos-slider');
    if (!sliderEl) return;

    // Cria slides apenas se ainda não existirem
    if (sliderEl.querySelectorAll('.slide').length === 0) {
      TESTEMUNHOS_AIRBNB.forEach(function (item, idx) {
        var div = document.createElement('div');
        div.className = 'slide' + (idx === 0 ? ' active' : '');
        div.innerHTML =
          '<p style="color:#FFD700; font-size:20px; margin-bottom:6px;">★★★★★</p>' +
          '<p><em>' + item.texto + '</em></p>' +
          '<p class="note">' + item.autor + '</p>';
        sliderEl.appendChild(div);
      });
    }

    // Cria dots (pontinhos) se não existirem
    var dotsEl = sliderEl.querySelector('.dots');
    if (!dotsEl) {
      dotsEl = document.createElement('div');
      dotsEl.className = 'dots';
      TESTEMUNHOS_AIRBNB.forEach(function () {
        var dot = document.createElement('span');
        dotsEl.appendChild(dot);
      });
      sliderEl.appendChild(dotsEl);
    }
  }

  /* ===================== SLIDER — TESTEMUNHOS ===================== */
  function initSlider() {
    var slider = qs('.testemunhos-slider');
    if (!slider) return;

    var slides = qsa('.slide', slider);
    var dots = qsa('.dots span', slider);
    if (!slides.length || !dots.length) return;

    var idx = 0;
    function show(n) {
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s) { s.classList.remove('active'); });
      dots.forEach(function (d) { d.classList.remove('active'); });
      slides[idx].classList.add('active');
      if (dots[idx]) dots[idx].classList.add('active');
    }

    dots.forEach(function (d, i) { on(d, 'click', function () { show(i); }); });

    var reduceMotion = false;
    try { reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
    var INTERVAL = 6000, timer = null;

    function start() { stop(); if (!reduceMotion) timer = setInterval(function () { show(idx + 1); }, INTERVAL); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    on(document, 'visibilitychange', function () { if (document.hidden) stop(); else start(); });
    on(slider, 'mouseenter', stop);
    on(slider, 'mouseleave', start);
    on(slider, 'touchstart', stop, { passive: true });
    on(slider, 'touchend', start, { passive: true });
    on(slider, 'keydown', function (e) {
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });

    show(0);
    start();
  }

  /* ===================== GALERIA — LIGHTBOX ===================== */
  function initLightbox() {
    var imgs = qsa('.gallery img');
    if (!imgs.length) return;

    var lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');

    var lightImg = document.createElement('img');
    lightbox.appendChild(lightImg);
    document.body.appendChild(lightbox);

    imgs.forEach(function (img) {
      img.style.cursor = 'pointer';
      on(img, 'click', function () {
        var src = img.getAttribute('src');
        if (!src) return;
        lightImg.src = src;
        lightbox.style.display = 'flex';
      });
    });

    on(lightbox, 'click', function (e) {
      if (e.target !== lightImg) lightbox.style.display = 'none';
    });
    on(document, 'keydown', function (e) {
      if (e.key === 'Escape') lightbox.style.display = 'none';
    });
  }

  /* ===================== MENU MOBILE ===================== */
  function initMobileMenu(updateOverlayCb) {
    var menu = qs('.menu');
    var toggle = qs('.menu-toggle');
    var topbar = qs('.topbar');
    if (!menu || !toggle || !topbar) return;

    on(toggle, 'click', function () {
      var open = menu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? '✕' : '☰';
      topbar.classList.toggle('menu-open', open);
      if (typeof updateOverlayCb === 'function') updateOverlayCb();
    });

    qsa('.menu a').forEach(function (a) {
      on(a, 'click', function () {
        var wasOpen = menu.classList.contains('active');
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
        topbar.classList.remove('menu-open');
        if (wasOpen && typeof updateOverlayCb === 'function') updateOverlayCb();
      });
    });

    on(window, 'resize', function () {
      if (window.innerWidth > 768 && menu.classList.contains('active')) {
        menu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
        topbar.classList.remove('menu-open');
        if (typeof updateOverlayCb === 'function') updateOverlayCb();
      }
    });
  }

  /* ===================== HEADER (FIXO + OVERLAY + ESCONDER) ===================== */
  function initTopbar() {
    var topbar = qs('.topbar');
    var hero = qs('.hero');
    var menu = qs('.menu');
    if (!topbar) return;

    var lastY = window.scrollY || 0;
    var SHOW_AT_TOP = 10;
    var DELTA = 6;
    var HIDE_MS = 250; // deve bater com o CSS (.25s)
    var hideTimer = null;

    function setOverlay(isOverlay) {
      if (isOverlay) {
        topbar.classList.add('is-overlay');
        topbar.classList.remove('is-solid');
      } else {
        topbar.classList.remove('is-overlay');
        topbar.classList.add('is-solid');
      }
    }

    function heroBehindHeader() {
      if (!hero) return false;
      var rect = hero.getBoundingClientRect();
      return rect.bottom > 60 && rect.top < (window.innerHeight * 0.9);
    }

    function updateOverlay() {
      var menuOpen = menu && menu.classList.contains('active');
      if (menuOpen) { setOverlay(false); return; }

      var isHiding = topbar.classList.contains('is-hidden') || topbar.classList.contains('is-hiding');
      var nearHero = heroBehindHeader();

      // Evita “flash” branco: se está a esconder e ainda sobre o hero → manter transparente
      if (isHiding && nearHero) { setOverlay(true); return; }

      var needSolid = !hero || (window.scrollY > 40 && !nearHero);
      setOverlay(!needSolid ? true : false);
    }

    function setTopbarHeightVar() {
      var h = topbar.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--topbar-h', h + 'px');
    }

    function onScrollHideShow() {
      var y = window.scrollY || 0;
      var dy = y - lastY;

      if (y <= SHOW_AT_TOP) {
        // Topo: mostra e limpa estados
        topbar.classList.remove('is-hidden');
        topbar.classList.remove('is-hiding');
        if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      } else if (dy > DELTA) {
        // A descer: esconder (apenas se ainda não estiver escondido)
        if (!topbar.classList.contains('is-hidden')) {
          topbar.classList.add('is-hiding');
          topbar.classList.add('is-hidden');
          if (hideTimer) clearTimeout(hideTimer);
          hideTimer = setTimeout(function () {
            topbar.classList.remove('is-hiding');
            updateOverlay();
          }, HIDE_MS);
        }
      }
      lastY = y;
    }

    on(window, 'scroll', function () { onScrollHideShow(); updateOverlay(); }, { passive: true });
    on(window, 'resize', function () { setTopbarHeightVar(); updateOverlay(); });
    on(window, 'load', function () { setTopbarHeightVar(); updateOverlay(); });

    // Integra com menu mobile
    initMobileMenu(updateOverlay);
  }

  /* ===================== BOOT ===================== */
  on(document, 'DOMContentLoaded', function () {
    try { renderTestemunhos(); } catch (e) { /* silencioso */ }
    try { initSlider(); } catch (e) { /* silencioso */ }
    try { initLightbox(); } catch (e) { /* silencioso */ }
    try { initTopbar(); } catch (e) { /* silencioso */ }
  });
})();
