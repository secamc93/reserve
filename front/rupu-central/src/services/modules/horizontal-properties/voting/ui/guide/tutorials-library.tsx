/**
 * Tutoriales de Votaciones: los videos en el orden real de una asamblea (ver `TutorialsPage`).
 */

'use client';

import { TutorialsPage } from '@shared/ui/tutorials-page';
import { TUTORIALS, TUTORIAL_ORDER, tutorialPoster, tutorialVideo, type TutorialSlug } from './tutorials';

/** Adónde lleva el botón de cada apartado para hacerlo de una vez. */
function actionFor(slug: TutorialSlug, businessId: number): { href: string; label: string } {
  if (slug === 'dias-de-votacion') return { href: `/properties/${businessId}/voting-groups/plans`, label: 'Ver planes' };
  return { href: `/properties/${businessId}/voting-groups`, label: 'Ir a Votaciones' };
}

export function TutorialsLibrary({ businessId }: { businessId: number }) {
  return (
    <TutorialsPage
      heading="Tutoriales de Votaciones"
      intro="Aprende a hacer una asamblea completa en Rupü: seis videos cortos, con voz, en el orden en que se hace."
      backHref={`/properties/${businessId}/voting-groups`}
      items={TUTORIAL_ORDER.map((slug) => ({
        slug,
        title: TUTORIALS[slug].title,
        points: TUTORIALS[slug].points,
        video: tutorialVideo(slug),
        poster: tutorialPoster(slug),
        action: actionFor(slug, businessId),
      }))}
    />
  );
}
