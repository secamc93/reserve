/**
 * Tokens del sistema de diseño de propiedad horizontal ("PH - Mapa del producto"):
 * papel neutro + tinta, un acento terracota para acciones y atención, y semánticos
 * (ok / peligro) para estados. Los usan todos los módulos.
 */

export const DS = {
  paper: '#f5f5f4',
  surface: '#ffffff',
  ink: '#1a1a1a',
  inkSoft: '#4b4a46',
  muted: '#8a8580',
  border: '#e4e2dd',
  borderStrong: '#d6d3cd',
  pendingBorder: '#c9c6c0',
  accent: '#c8603f',
  live: '#c8382d',
  yes: '#1f8a4c',
  no: '#c8382d',
  abstain: '#8a8580',
  reachedBg: '#e3f1e8',
  reachedFg: '#1f8a4c',
  missingBg: '#fbe9e4',
  missingFg: '#c8603f',
  // Turquesa Rupü (logo #2CD8CC → #18A0AE). Los rellenos con texto blanco usan el tono profundo,
  // que pasa contraste AA (4,7:1); el del logo solo como acento.
  brand: '#0F7F8A',
  brandHover: '#0C6B76',
  brandBright: '#18A0AE',
  brandLight: '#2CD8CC',
  brandSoft: '#E3F5F5',
} as const;
