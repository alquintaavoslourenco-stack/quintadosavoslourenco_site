/* ==========================================================
   Helpers
   ========================================================== */
const qs  = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => root.querySelectorAll(sel);

/* ==========================================================
   Dados — Testemunhos
   ========================================================== */
const TESTEMUNHOS_AIRBNB = [
  { texto: `Estadia perfeita: lugar lindo, casa impecável e anfitriões extremamente simpáticos. Levámos 5 patudos; adoraram o exterior e o A/C. Queremos voltar!`, autor: `— Laura, Airbnb (julho 2025)` },
  { texto: `Local perfeito para fugir à correria: comodidades excelentes e jardim fantástico. Animais felizes e pão quentinho no portão. Sentimo-nos em casa.`, autor: `— Tisha, Airbnb (maio 2025)` },
  { texto: `Casa incrivelmente equipada: beleza do antigo com comodidades do presente. Vista incrível. Excelente estadia.`, autor: `— Joana, Airbnb (abril 2025)` },
  { texto: `Estadia maravilhosa: casa muito limpa, rústica e acolhedora com comodidades modernas. Anfitrião sempre disponível.`, autor: `— Beatriz, Airbnb (abril 2025)` },
  { texto: `Refúgio na serra para descansar. Pequeno-almoço divinal e anfitriões 24/7. Casa ampla e exterior impecável.`, autor: `— Patrícia, Airbnb (fevereiro 2025)` },
  { texto: `Propriedade incrível: muito limpa e confortável. Cão e gato felizes. Amei o burro Uva e os porcos Elvis e Shakira.`, autor: `— Juliane, Airbnb (setembro 2025)` },
  { texto: `Anfitriões afáveis e sempre disponíveis. Casa bem equipada; exterior fantástico e cercado. Pequeno-almoço diário delicioso.`, autor: `— Diogo, Airbnb (março 2025)` }
];

/* ==========================================================
   Renderiza slides de testemunhos se a secção existir
   ========================================================== */
function renderTestemunhos() {
  const sliderEl = qs('#testemunhos .testemunhos-slider') || qs('.testemunhos-slider');
  if (!sliderEl) return;

  let dotsEl = sliderEl.querySelector('.dots');
  if (!dotsEl) {
    dotsEl = document.createElement('div');
    dotsEl.className = 'dots';
    sliderEl.appendChild(dotsEl);
  }

  // evita duplicar se já houver
  const existingSlides = qsa('.slide', sliderEl);
  if (existingSlides.length === 0) {
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

/* ==========================================================
   Slider — com bolinhas e autoplay
   ========================================================== */
function initSlider() {
  const slider = qs('.testemunhos-slider');
  if (!slider) return;

  const slides = qsa('.testemunhos-slider .slide');
  if (slides.length === 0) return;

  const dotsContainer = qs('.testemunhos-slider .dots');
  let dots = [];
  let slideIndex = 0;
  let autoPlay;

  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.addEventListener('click', () => showSlide(i));
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

  function nextSlide() { showSlide(slideIndex + 1); }
  function startAutoPlay() { stopAutoPlay(); autoPlay = setInterval(nextSlide, 6000); }
  function stopAutoPlay() { if (autoPlay) clearInterval(autoPlay); }

  slider.addEventListener('mouseenter', stopAutoPlay);
  slider.addEventListener('mouseleave', startAutoPlay);
  slider.addEventListener('touchstart', stopAutoPlay, { passive: true });
  slider.addEventListener('touchend', startAutoPlay, { passive: true });

  showSlide(0);
  startAutoPlay();
}

/* ==========================================================
   Galeria — Lightbox
   ========================================================== */
function initLightbox() {
  const galleryImgs = qsa('.gallery img');
  if (galleryImgs.length === 0) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  const lightboxImg = document.createElement('img');
  lightbox.appendChild(lightboxImg);
  document.body.appendChild(lightbox);

  galleryImgs.forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      lightboxImg.src = img.getAttribute('src');
      lightbox.style.display = 'flex';
    });
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) lightbox.style.display = 'none';
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.style.display = 'none';
  });
}

/* ==========================================================
   Menu Mobile — abrir/fechar
   ========================================================== */
function initMobileMenu() {
  const menu   = qs('.menu');
  const toggle = qs('.menu-toggle');
  if (!menu || !toggle) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('active');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // fecha ao clicar num link
  qsa('.menu a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // fecha se voltar ao desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ==========================================================
   Boot
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  renderTestemunhos();
  initSlider();
  initLightbox();
  initMobileMenu();
});
// === Menu Mobile com ícone dinâmico ===
function initMobileMenu() {
  const menu   = document.querySelector('.menu');
  const toggle = document.querySelector('.menu-toggle');
  if (!menu || !toggle) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('active');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.textContent = open ? '✕' : '☰';  // ← muda o ícone
  });

  // Fecha ao clicar num link
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';  // ← volta ao ícone normal
    });
  });

  // Fecha se voltar ao desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      menu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    }
  });
}
