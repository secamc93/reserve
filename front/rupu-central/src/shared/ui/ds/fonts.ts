/**
 * Tipografías del sistema de diseño de propiedad horizontal (Public Sans + JetBrains Mono).
 *
 * Se cargan con next/font y se exponen como variables CSS; se aplican en el contenido de las
 * pantallas de propiedad horizontal (`dsFontRoot`). La fuente global de la app no cambia.
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

/** Contenedor raíz: declara las variables de fuente y aplica Public Sans como fuente base. */
export const dsFontRoot = `${publicSans.variable} ${jetBrainsMono.variable} font-[family-name:var(--font-vt-sans)]`;

/** Clase utilitaria para cifras y códigos (JetBrains Mono). */
export const dsMono = 'font-[family-name:var(--font-vt-mono)]';

/** Alias usados por el módulo de votaciones. */
export const votingFontRoot = dsFontRoot;
export const vtMono = dsMono;
