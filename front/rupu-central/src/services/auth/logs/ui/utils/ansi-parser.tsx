import React from 'react';

// Mapeo de códigos ANSI a colores
const ANSI_COLORS: Record<number, string> = {
  30: 'text-gray-400', // Negro
  31: 'text-red-400', // Rojo
  32: 'text-green-400', // Verde
  33: 'text-yellow-400', // Amarillo
  34: 'text-blue-400', // Azul
  35: 'text-purple-400', // Magenta
  36: 'text-cyan-400', // Cian
  37: 'text-white', // Blanco
  90: 'text-gray-500', // Gris oscuro
  91: 'text-red-500', // Rojo brillante
  92: 'text-green-500', // Verde brillante
  93: 'text-yellow-500', // Amarillo brillante
  94: 'text-blue-500', // Azul brillante
  95: 'text-purple-500', // Magenta brillante
  96: 'text-cyan-500', // Cian brillante
  97: 'text-white', // Blanco brillante
};

// Colores según nivel de log
const LEVEL_COLORS: Record<string, string> = {
  error: 'text-red-400',
  err: 'text-red-400',
  warn: 'text-yellow-400',
  warning: 'text-yellow-400',
  wrn: 'text-yellow-400',
  info: 'text-green-400',
  inf: 'text-green-400',
  debug: 'text-cyan-400',
  dbg: 'text-cyan-400',
  trace: 'text-gray-400',
};

interface AnsiSegment {
  text: string;
  color?: string;
  bold?: boolean;
  underline?: boolean;
}

/**
 * Parsea una cadena con códigos ANSI y retorna un array de segmentos con estilos
 */
export function parseAnsi(text: string): AnsiSegment[] {
  const segments: AnsiSegment[] = [];
  // Regex mejorado para capturar códigos ANSI en diferentes formatos
  // Soporta: \x1b[ (hexadecimal) o [ (sin escape, como en algunos logs)
  const ansiRegex = /(?:\x1b\[|\[)([0-9;]+)m/g;
  let lastIndex = 0;
  let currentColor: string | undefined;
  let currentBold = false;
  let currentUnderline = false;

  let match;
  while ((match = ansiRegex.exec(text)) !== null) {
    // Agregar texto antes del código ANSI
    if (match.index > lastIndex) {
      const textBefore = text.substring(lastIndex, match.index);
      if (textBefore) {
        segments.push({
          text: textBefore,
          color: currentColor,
          bold: currentBold,
          underline: currentUnderline,
        });
      }
    }

    // Procesar códigos ANSI (pueden venir como "34;4" o "33;4")
    const codes = match[1].split(';').map(Number).filter(n => !isNaN(n));
    for (const code of codes) {
      if (code === 0) {
        // Reset
        currentColor = undefined;
        currentBold = false;
        currentUnderline = false;
      } else if (code === 1 || code === 22) {
        // Bold on/off
        currentBold = code === 1;
      } else if (code === 4 || code === 24) {
        // Underline on/off
        currentUnderline = code === 4;
      } else if (code >= 30 && code <= 37) {
        // Colores básicos (foreground)
        currentColor = ANSI_COLORS[code];
      } else if (code >= 90 && code <= 97) {
        // Colores brillantes (foreground)
        currentColor = ANSI_COLORS[code];
      } else if (code >= 40 && code <= 47) {
        // Colores de fondo (no los usamos, pero los ignoramos silenciosamente)
      } else if (code >= 100 && code <= 107) {
        // Colores de fondo brillantes (no los usamos)
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Agregar texto restante
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      segments.push({
        text: remainingText,
        color: currentColor,
        bold: currentBold,
        underline: currentUnderline,
      });
    }
  }

  // Si no hay segmentos (sin códigos ANSI), retornar el texto completo
  if (segments.length === 0) {
    segments.push({ text });
  }

  return segments;
}

/**
 * Renderiza un texto con códigos ANSI como elementos React
 */
export function renderAnsiText(text: string, defaultColor?: string): React.ReactNode {
  const segments = parseAnsi(text);
  
  return segments.map((segment, index) => {
    const colorClass = segment.color || defaultColor || 'text-green-400';
    const classes = [
      colorClass,
      segment.bold && 'font-bold',
      segment.underline && 'underline',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span key={index} className={classes}>
        {segment.text}
      </span>
    );
  });
}

/**
 * Obtiene el color por defecto según el nivel de log
 */
export function getLevelColor(level?: string): string {
  if (!level) return 'text-green-400';
  const levelLower = level.toLowerCase();
  return LEVEL_COLORS[levelLower] || 'text-green-400';
}
