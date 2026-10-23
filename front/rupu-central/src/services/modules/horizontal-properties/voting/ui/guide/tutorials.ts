/**
 * Videos tutoriales del módulo de votaciones (grabados con `pnpm tutorials` sobre una propiedad de
 * demostración con datos ficticios y publicados en public/tutoriales).
 */

export type TutorialSlug = 'crear-asamblea' | 'agregar-votaciones' | 'asistencia-y-qr' | 'dias-de-votacion' | 'votacion-en-vivo';

export interface Tutorial {
  slug: TutorialSlug;
  title: string;
  points: string[];
}

export const TUTORIALS: Record<TutorialSlug, Tutorial> = {
  'crear-asamblea': {
    slug: 'crear-asamblea',
    title: 'Crea la asamblea',
    points: ['Ponle nombre y descripción.', 'Elige la fecha y hora en que se va a votar.', 'Ajusta el quórum (por defecto 51% del coeficiente).'],
  },
  'agregar-votaciones': {
    slug: 'agregar-votaciones',
    title: 'Agrega las votaciones',
    points: ['Una votación por cada punto del orden del día.', 'Elige cómo se aprueba (mayoría u otra regla).', 'Sí, No y Abstención ya vienen listas.'],
  },
  'asistencia-y-qr': {
    slug: 'asistencia-y-qr',
    title: 'Asistencia y código QR',
    points: ['Proyecta o comparte el QR: se vota desde el celular, sin apps.', 'Marca quién llegó; el quórum se calcula solo.', 'Registra apoderados de quienes no asisten.'],
  },
  'dias-de-votacion': {
    slug: 'dias-de-votacion',
    title: 'Cubre el día de votación',
    points: ['Compra el día de tu asamblea ($50.000) o un mes ilimitado.', 'Pagas con Nequi, PSE o tarjeta en Wompi.', 'Las administradoras cubren varios conjuntos con un plan.'],
  },
  'votacion-en-vivo': {
    slug: 'votacion-en-vivo',
    title: 'Vota en vivo y descarga el informe',
    points: ['Inicia la votación: los votos llegan en vivo con su coeficiente.', 'Quien no tenga celular vota con el administrador.', 'Cierra y descarga el informe PDF para el acta.'],
  },
};

export const tutorialVideo = (slug: TutorialSlug) => `/tutoriales/${slug}.mp4`;
export const tutorialPoster = (slug: TutorialSlug) => `/tutoriales/${slug}.jpg`;
