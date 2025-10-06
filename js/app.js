// --- Helper: iniciar algo só se os elementos existirem
function qsAll(sel, root = document) { return root.querySelectorAll(sel); }
function qs(sel, root = document) { return root.querySelector(sel); }

// --- Slider de Testemunhos com Bolinhas (seguro)
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

  function startAutoPlay() { autoPlay = setInterval(nextSlide, 5000); }
  function stopAutoPlay() { clearInterval(autoPlay); }

  slider.addEventListener('mouseenter', stopAutoPlay);
  slider.addEventListener('mouseleave', startAutoPlay);

  showSlide(0);
  startAutoPlay();
});

// --- Lightbox para Galeria (seguro e com Esc)
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

