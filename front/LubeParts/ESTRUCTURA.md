# 📁 Estructura Reorganizada de LubeParts

## Cambios Realizados

Se realizó un refactor completo para separar HTML, CSS y JavaScript, eliminando código mezclado.

## Nueva Estructura

```
src/
├── components/
│   ├── ui/                          # 🔧 Componentes reutilizables
│   │   ├── Carousel.astro          # Carrusel genérico (HTML + JS)
│   │   └── Button.astro            # Botón reutilizable
│   ├── sections/                    # 📄 Secciones de páginas
│   │   ├── HeroSection.astro       # Hero mejorado con Carousel
│   │   ├── FeaturesSection.astro   # (futuro)
│   │   └── ...
│   ├── common/
│   │   ├── Navbar.astro
│   │   └── Footer.astro
│   └── ...
├── pages/                           # 📰 Páginas del sitio
│   ├── index.astro
│   ├── productos.astro
│   ├── contacto.astro
│   └── ...
├── styles/                          # 🎨 Estilos centralizados
│   ├── global.css                  # Variables CSS globales
│   ├── carousel.css                # Estilos del carrusel
│   ├── sections.css                # Estilos de secciones
│   └── ...
├── scripts/                         # ⚙️ JavaScript reutilizable (futuro)
│   └── carousel.ts
└── layouts/
    └── BaseLayout.astro
```

## 🎨 Sistema de Colores - Variables CSS

### Archivo: `src/styles/global.css`

```css
:root {
  /* Colores primarios - Naranja + Azul */
  --color-primary-orange: #E67E22;
  --color-primary-orange-dark: #D35400;
  --color-primary-blue: #1E40AF;
  --color-primary-blue-dark: #1e3a8a;
  --color-primary-blue-light: #3b82f6;

  /* Variables espaciado, transiciones, etc. */
}
```

### Uso en Componentes

```html
<!-- ✅ CORRECTO -->
<div style="background-color: var(--color-primary-orange);">
  Fondo naranja
</div>

<!-- ❌ EVITAR -->
<div style="background-color: #E67E22;">
  Hardcoded color
</div>
```

## 📋 Guía de Componentes

### Componente: `Carousel.astro`
- **Ubicación**: `src/components/ui/Carousel.astro`
- **Uso**: Importar como componente reutilizable
- **Props**: `slides`, `autoPlay`, `interval`
- **Estilos**: Importa `carousel.css`

```astro
---
import Carousel from "../ui/Carousel.astro";
---

<Carousel slides={mySlides}>
  <!-- Contenido personalizado -->
</Carousel>
```

### Componente: `Button.astro`
- **Ubicación**: `src/components/ui/Button.astro`
- **Props**: `href`, `type`, `variant`, `size`, `class`
- **Variantes**: `primary` (naranja), `secondary` (azul), `outline`

```astro
<Button variant="primary" size="lg" href="/productos">
  Ver Catálogo
</Button>
```

## 📝 Cambios Principales

1. **Separación de Responsabilidades**
   - HTML: Templates `.astro`
   - CSS: Archivos dedicados en `styles/`
   - JS: Scripts en `<script>` dentro de componentes

2. **Paleta de Colores Unificada**
   - Naranja (#E67E22) + Azul (#1E40AF)
   - Cambios globales vía variables CSS
   - Fácil mantenimiento y actualización

3. **Reutilización de Componentes**
   - `Carousel.astro`: Genérico y sin estilos hardcodeados
   - `Button.astro`: Multiple variantes
   - Importar donde se necesite

## ✨ Próximas Mejoras

- [ ] Crear más componentes UI (Card, Badge, etc.)
- [ ] Extraer JavaScript a `src/scripts/`
- [ ] Crear `FeaturesSection.astro` componente
- [ ] Mejorar responsividad
- [ ] Agregar animaciones suaves

## 🚀 Cómo Usar

1. **Cambiar colores globalmente**: Editar `src/styles/global.css`
2. **Agregar nuevo componente UI**: Crear archivo en `src/components/ui/`
3. **Crear nueva sección**: Usar componentes UI en `src/components/sections/`
4. **Estilos específicos**: Crear archivo CSS dedicado en `src/styles/`

## 📚 Recursos

- [Astro Docs](https://docs.astro.build)
- [Tailwind CSS](https://tailwindcss.com)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
