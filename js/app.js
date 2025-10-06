/* ===== Helpers ===== */
function qsAll(sel, root = document) { return root.querySelectorAll(sel); }
function qs(sel, root = document) { return root.querySelector(sel); }

/* ==========================================================
   TESTEMUNHOS AIRBNB — dados + criação automática dos slides
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
    texto: `Um refúgio na serra para descansar e aproveitar a natureza. Pequeno-almoço divinal e anfitriões sempre prontos a ajudar. Casa ampla, exterior impecável e A/C em todas as divisões.`,
    autor: `— Patrícia, Airbnb (fevereiro 2025)`
  },
  {
    texto: `Propriedade incrível: muito limpa e confortável. O meu cão e gato adoraram. Amei o burro Uva e os porcos Elvis e Shakira. Tranquilo e perfeito para escapar da cidade.`,
    autor: `— Juliane, Airbnb (setembro 2025)`
  },
  {
    texto: `Estadia maravilhosa. Anfitriões muito afáveis e sempre disponíveis. Casa bem equipada, lareira e A/C; exterior fantástico, cercado e com vistas deslumbrantes. Pequeno-almoço diário delicioso.`,
    autor: `— Diogo, Airbnb (março 2025)`
  }
];

/* --- Render dos slides ANTES do slider arrancar --- */
document.addEventListener('DOMContentLoaded', () => {
  const sliderEl = qs('#testemunhos .testemunhos-slider') || qs('.testemunhos-slider');
  if (!sliderEl || !TESTEMUNHOS_AIRBNB.length) return;

  // garante o recipiente das bolinhas
  const dotsEl = sliderEl.querySelector('.dots') || (() => {
    const d = document.createElement('div'); d.className = 'dots'; sliderEl.appendChild(d); return d;
  })();

  // cria os slides com estrelas douradas
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
});

/* ==========================================================
   Slider de Testemunhos com Bolinhas (seguro)
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const slider = qs('.testemunhos-slider');
  const slides = qsAll('.testemunhos-slider .slide');
  const dotsContainer = qs('.testemunhos-slider .dots');

  // Se não houver slider nesta página, sai sem erro.
  if (!slider || slides.length === 0) return;

  let slideIndex = 0;
  let autoPlay;

  // cria bolinhas só se existir o recipiente .dots
  if (dotsContainer) {
    slides.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.addEventListener('click', () => showSlide(i));
      dotsContainer.appendChild(dot);
    });
  }

  const dots = dotsContainer ? qsAll('span', dotsContainer) : [];

  function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    slideIndex = (index + slides.length) % slides.length;
    slides[slideIndex].classList.add('active');
    if (dots[slideIndex]) dots[slideIndex].classList.add('active');
  }

  function nextSlide() { showSlide(slideIndex + 1); }

  function startAutoPlay() { autoPlay = setInterval(nextSlide, 6000); }
  function stopAutoPlay() { clearInterval(autoPlay); }

  slider.addEventListener('mouseenter', stopAutoPlay);
  slider.addEventListener('mouseleave', startAutoPlay);

  showSlide(0);
  startAutoPlay();
});

/* ==========================================================
   Lightbox para Galeria (seguro e com Esc)
   ========================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const galleryImgs = qsAll('.gallery img');
  if (galleryImgs.length === 0) return; // não há galeria nesta página

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

  // clicar fora ou tecla Esc fecha
  lightbox.addEventListener('click', e => { if (e.target !== lightboxImg) lightbox.style.display = 'none'; });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') lightbox.style.display = 'none'; });
});

