// Lógica de interacción del catálogo de productos

export function initCatalogInteraction() {
  const catalog = document.getElementById('product-catalog');
  const closeBtn = document.getElementById('catalog-close-btn');
  const carouselSlides = document.querySelectorAll('.carousel-slide-clickable');

  if (!catalog) return;

  // Abrir catálogo cuando se hace clic en una imagen del carousel
  carouselSlides.forEach((slide) => {
    slide.addEventListener('click', (e) => {
      e.preventDefault();
      // Abrir el catálogo
      catalog.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Cerrar catálogo con el botón X
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      catalog.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }

  // Cerrar catálogo al hacer clic fuera de él (en el overlay)
  document.addEventListener('click', (e) => {
    if (
      catalog.classList.contains('active') &&
      !catalog.contains(e.target as Node) &&
      !(e.target as HTMLElement).classList.contains('carousel-slide-clickable')
    ) {
      // Solo cerrar si el clic es en el área fuera del catálogo
      const clickX = (e as MouseEvent).clientX;
      if (clickX < window.innerWidth - 620) {
        catalog.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    }
  });

  // Cerrar con tecla Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && catalog.classList.contains('active')) {
      catalog.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });
}

// Auto-inicializar si el script se ejecuta en el cliente
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initCatalogInteraction);
}
