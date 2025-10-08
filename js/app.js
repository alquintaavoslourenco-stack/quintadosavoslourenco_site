/* ==========================================================
   Helpers
   ========================================================== */
const qs  = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => root.querySelectorAll(sel);

/* ==========================================================
   Dados — Testemunhos (Airbnb/Booking)
   (podes editar livremente os textos abaixo)
   ========================================================== */
const TESTEMUNHOS_AIRBNB = [
  {
    texto: `Estadia perfeita: lugar lindo, casa impecável e anfitriões extremamente simpáticos. Levámos 5 patudos; adoraram o exterior e o A/C. Queremos voltar!`,
    autor: `— Laura, Airbnb (julho 2025)`
  },
  {
    texto: `Local perfeito para fugir à correria: comodidades excelentes e jardim fantástico. Animais felizes e pequeno-almoço com pão quentinho no portão. Sentimo-nos em casa.`,
    autor: `— Tisha, Airbnb (maio 2025)`
  },
  {
    texto: `Casa incrivelmente equipada: beleza do antigo com comodidades do presente. Vista incrível. Foi, sem dúvida, uma excelente estadia.`,
    autor: `— Joana, Airbnb (abril 2025)`
  },
  {
    texto: `Estadia maravilhosa: casa muito limpa, rústica e acolhedora com comodidades modernas. Pequeno-almoço delicioso e anfitrião sempre disponível. Voltaremos certamente!`,
    autor: `— Beatriz, Airbnb (abril 2025)`
  },
  {
    texto: `Um refúgio na serra para descansar e aproveitar a natureza. Pequeno-almoço divinal e anfitriões sempre prontos a ajudar. Casa ampla e exterior impecável.`,
    autor: `— Patrícia, Airbnb (fevereiro 2025)`
  },
  {
    texto: `Propriedade incrível: muito limpa e confortável. O meu cão e gato adoraram. Amei o burro Uva e os porcos Elvis e Shakira. Perfeito para escapar da cidade.`,
    autor: `— Juliane, Airbnb (setembro 2025)`
  },
  {
    texto: `Anfitriões afáveis e sempre disponíveis. Casa bem equipada (lareira e A/C); exterior fantástico e cercado. Pequeno-almoço diário delicioso. Vamos repetir!`,
    autor: `— Diogo, Airbnb (março 2025)`
  }
];

/* ==========================================================
   Render — Cria os slides de testemunhos (se a secção existir)
   ========================================================== */
function renderTestemunhos() {
  const sliderEl = qs('#testemunhos .testemunhos-slider') || qs('.testemunhos-slider');
  if (!sliderEl) return;

  // garante recipiente das bolinhas
  let dotsEl = sliderEl.querySelector('.dots');
  if (!dotsEl) {
    dotsEl = document.createElement('div');
    dotsEl.className = 'dots';
    sliderEl.appendChild(dotsEl);
  }

  // se já houver slides, não duplica
  const existingSlides = qsa('.slide', sliderEl);
  if (existingSlides.length === 0 && TESTEMUNHOS_AIRBNB.length > 0) {
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

  // cria bolinhas consoante nº de slides
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

  function startAutoPlay() {
    stopAutoPlay();
    autoPlay = setInterval(nextSlide, 6000);
  }
  function stopAutoPlay() {
    if (autoPlay) clearInterval(autoPlay);
  }

  // Pausa no hover e em toque
  slider.addEventListener('mouseenter', stopAutoPlay);
  slider.addEventListener('mouseleave', startAutoPlay);
  slider.addEventListener('touchstart', stopAutoPlay, { passive: true });
  slider.addEventListener('touchend', startAutoPlay, { passive: true });

  showSlide(0);
  startAutoPlay();
}

/* ==========================================================
   Galeria — Lightbox (fecha ao clicar fora e com Esc)
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

  // Fechar ao clicar fora da imagem
  lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) lightbox.style.display = 'none';
  });

  // Fechar com Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.style.display = 'none';
  });
}

/* ==========================================================
   Menu Mobile — Abre/fecha (só se existir .menu-toggle)
   ========================================================== */
function initMobileMenu() {
  const toggle = qs('.menu-toggle');
  const menu   = qs('.menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const opened = menu.classList.toggle('active');
    toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });

  // fecha ao clicar em links
  qsa('.menu a').forEach(a => {
    a.addEventListener('click', () => menu.classList.remove('active'));
  });

  // fecha se redimensionar para desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) menu.classList.remove('active');
  });
}

/* ==========================================================
   Boot
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // 1) Cria slides de testemunhos (se existir a secção)
  renderTestemunhos();

  // 2) Inicia slider (se houver)
  initSlider();

  // 3) Lightbox da galeria (se houver)
  initLightbox();

  // 4) Menu mobile (se houver botão)
  initMobileMenu();
});
