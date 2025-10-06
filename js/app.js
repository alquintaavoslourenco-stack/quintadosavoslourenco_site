// optional JS placeholder
// --- Slider de Testemunhos com Bolinhas ---
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.testemunhos-slider .slide');
  const dotsContainer = document.querySelector('.testemunhos-slider .dots');
  let slideIndex = 0;
  let autoPlay;

  // cria uma bolinha para cada slide
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.addEventListener('click', () => showSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('span');

  function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));

    slideIndex = (index + slides.length) % slides.length;
    slides[slideIndex].classList.add('active');
    dots[slideIndex].classList.add('active');
  }

  function nextSlide() {
    showSlide(slideIndex + 1);
  }

  // autoplay
  function startAutoPlay() {
    autoPlay = setInterval(nextSlide, 5000); // muda a cada 5s
  }

  function stopAutoPlay() {
    clearInterval(autoPlay);
  }

  // pausa ao passar o rato
  const slider = document.querySelector('.testemunhos-slider');
  slider.addEventListener('mouseenter', stopAutoPlay);
  slider.addEventListener('mouseleave', startAutoPlay);

  // inicia
  showSlide(0);
  startAutoPlay();
});
