/**
 * Tipografías del módulo de votaciones (rediseño).
 *
 * Se cargan con next/font y se exponen como variables CSS para aplicarlas
 * SOLO en los contenedores del módulo de votaciones; la fuente global de la
 * app (Inter, en app/layout.tsx) no se modifica.
 */

import { Public_Sans, JetBrains_Mono } from 'next/font/google';

const publicSans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-vt-sans',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-vt-mono',
  display: 'swap',
});

/**
 * Clase para el contenedor raíz de cada pantalla de votaciones:
 * declara las variables de fuente y aplica Public Sans como fuente base.
 */
export const votingFontRoot = `${publicSans.variable} ${jetBrainsMono.variable} font-[family-name:var(--font-vt-sans)]`;

/** Clase utilitaria para cifras (JetBrains Mono). */
export const vtMono = 'font-[family-name:var(--font-vt-mono)]';
