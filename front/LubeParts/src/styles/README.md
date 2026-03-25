# 🎨 Estructura de Estilos - LubeParts

Organización completa de CSS para mantener código limpio y reutilizable.

## 📁 Estructura de Carpetas

```
src/styles/
├── global.css                  # Variables CSS + Reset global
├── carousel.css                # Estilos del carrusel
├── sections.css                # Estilos de secciones generales
├── index.css                   # 🔗 Importa todos los estilos
│
├── utils/                      # 🔧 Utilidades reutilizables
│   ├── animations.css         # @keyframes y animaciones
│   ├── utilities.css          # Clases de utilidad (flexbox, text, etc)
│   └── responsive.css         # Breakpoints y media queries
│
├── components/                 # 🎛️ Estilos de componentes
│   ├── buttons.css            # Botones (tamaños y variantes)
│   ├── cards.css              # Tarjetas (variantes: featured, product, feedback)
│   ├── forms.css              # (futuro) Formularios
│   └── navbar.css             # (futuro) Barra de navegación
│
├── sections/                   # 📄 Estilos de secciones
│   ├── hero.css               # Sección hero con overlay
│   ├── features.css           # (futuro) Características
│   ├── brands.css             # (futuro) Carrusel de marcas
│   └── contact.css            # (futuro) Contacto
│
├── layouts/                    # 🏗️ Estilos de layouts
│   ├── navbar.css             # (futuro) Navbar
│   └── footer.css             # (futuro) Footer
│
└── README.md                   # Este archivo
```

## 📝 Descripción de Cada Archivo

### Global
| Archivo | Contenido |
|---------|-----------|
| `global.css` | Variables CSS (colores, espacios, transiciones) + Reset |

### Utils
| Archivo | Contenido |
|---------|-----------|
| `animations.css` | @keyframes reutilizables (fadeIn, slide, bounce, glow) |
| `utilities.css` | Clases de utilidad (flex-center, text-truncate, glass-effect, etc) |
| `responsive.css` | Media queries y breakpoints reutilizables |

### Components
| Archivo | Contenido |
|---------|-----------|
| `buttons.css` | `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline`, `.btn-ghost` |
| `cards.css` | `.card`, `.card-elevated`, `.feature-card`, `.product-card` |
| `forms.css` | (Futuro) Input, textarea, labels |
| `navbar.css` | (Futuro) Navegación |

### Sections
| Archivo | Contenido |
|---------|-----------|
| `hero.css` | Hero section con overlay, indicadores |
| `features.css` | (Futuro) Sección de características |
| `brands.css` | (Futuro) Carrusel de marcas |
| `contact.css` | (Futuro) Sección de contacto |

### Layouts
| Archivo | Contenido |
|---------|-----------|
| `navbar.css` | (Futuro) Estilos de navbar |
| `footer.css` | (Futuro) Estilos de footer |

---

## 🎯 Cómo Usar

### Importar Estilos en Componentes

```astro
---
import "../../styles/index.css";  // Importa todo
// O específicamente:
import "../../styles/components/buttons.css";
import "../../styles/sections/hero.css";
---
```

### Crear Nuevos Estilos

1. **Nuevo componente UI** → Crear archivo en `components/`
2. **Nueva sección** → Crear archivo en `sections/`
3. **Clase de utilidad** → Agregar a `utils/utilities.css`
4. **Nueva animación** → Agregar a `utils/animations.css`
5. **Actualizar `index.css`** → Importar el nuevo archivo

### Usar Variables CSS

```css
/* Colores */
color: var(--color-primary-orange);
background: var(--color-primary-blue);

/* Espacios */
padding: var(--space-md);
gap: var(--space-lg);

/* Transiciones */
transition: all var(--transition-normal);
```

---

## 🎨 Variables Disponibles

### Colores
```css
--color-primary-orange: #E67E22
--color-primary-orange-dark: #D35400
--color-primary-blue: #1E40AF
--color-primary-blue-dark: #1e3a8a
--color-dark: #0A0A0A
--color-light: #FFFFFF
```

### Espacios
```css
--space-xs: 0.5rem
--space-sm: 1rem
--space-md: 1.5rem
--space-lg: 2rem
--space-xl: 3rem
--space-2xl: 4rem
--space-3xl: 6rem
```

### Transiciones
```css
--transition-fast: 150ms ease-in-out
--transition-normal: 300ms ease-in-out
--transition-slow: 500ms ease-in-out
```

---

## ✨ Clases de Utilidad Disponibles

### Flexbox
- `.flex-center` - Centrado flexible
- `.flex-between` - Espacio entre
- `.flex-col-center` - Columna centrada

### Texto
- `.text-truncate` - Truncar en 1 línea
- `.text-clamp` - Truncar en 2 líneas
- `.gradient-text` - Texto con gradiente

### Efectos
- `.glass-effect` - Efecto vidrio (blur)
- `.shadow-orange` - Sombra naranja
- `.hover-scale` - Escala al pasar

### Animaciones
- `.animate-fadeIn` - Fade in
- `.animate-fadeInUp` - Fade up
- `.animate-pulse` - Pulso
- `.animate-glow` - Resplandor

---

## 🚀 Flujo de Trabajo

1. **Diseñar** → Definir variables en `global.css`
2. **Crear** → Componente en `src/components/ui/`
3. **Estilizar** → Archivo CSS en `src/styles/components/`
4. **Importar** → En `index.css`
5. **Usar** → En páginas/secciones

---

## 📚 Recursos

- [MDN CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Tailwind CSS](https://tailwindcss.com)
- [CSS Animation](https://developer.mozilla.org/en-US/docs/Web/CSS/animation)
