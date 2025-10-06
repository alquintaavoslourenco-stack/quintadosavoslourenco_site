// optional JS placeholder
// --- Slider de Testemunhos ---
let slideIndex = 0;
const slides = document.querySelectorAll('.testemunhos-slider .slide');

function showSlides() {
  slides.forEach((slide, i) => {
    slide.classList.remove('active');
    if (i === slideIndex) slide.classList.add('active');
  });

  slideIndex++;
  if (slideIndex >= slides.length) slideIndex = 0;

  setTimeout(showSlides, 5000); // muda de testemunho a cada 5 segundos
}

// iniciar quando a página carregar
document.addEventListener('DOMContentLoaded', showSlides);
