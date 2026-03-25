// Lógica del Carousel Hero

export function initCarouselHero() {
  let currentSlide = 0;
  const totalSlides = 3;
  const slideInterval = 5000;

  const carouselTrack = document.getElementById('carousel-track');
  const indicator0 = document.getElementById('carousel-indicator-0');
  const indicator1 = document.getElementById('carousel-indicator-1');
  const indicator2 = document.getElementById('carousel-indicator-2');
  const indicators = [indicator0, indicator1, indicator2];

  function updateCarousel() {
    if (!carouselTrack) return;

    const offset = currentSlide * -100;
    carouselTrack.style.transform = `translateX(${offset}%)`;

    // Update all indicators
    indicators.forEach((ind, i) => {
      if (ind) {
        if (i === currentSlide) {
          ind.classList.add('bg-white/80');
          ind.classList.remove('bg-white/30');
        } else {
          ind.classList.remove('bg-white/80');
          ind.classList.add('bg-white/30');
        }
      }
    });
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
  }

  // Allow manual indicator clicks
  indicators.forEach((indicator, index) => {
    if (indicator) {
      indicator.addEventListener('click', () => {
        currentSlide = index;
        updateCarousel();
      });
    }
  });

  const autoPlayInterval = setInterval(nextSlide, slideInterval);
}

// Auto-inicializar si el script se ejecuta en el cliente
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initCarouselHero);
}
