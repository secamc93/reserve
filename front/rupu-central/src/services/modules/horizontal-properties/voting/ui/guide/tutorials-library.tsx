/**
 * Página de Tutoriales: los videos de votaciones en el orden real de una asamblea, cada uno en su
 * apartado con los puntos clave. Arriba, un índice para saltar a cualquiera (#slug).
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VT, VtNotice, votingFontRoot, vtBtn, vtMono } from '../design';
import { TUTORIALS, TUTORIAL_ORDER, tutorialPoster, tutorialVideo, type TutorialSlug } from './tutorials';

/** Adónde lleva el botón de cada apartado para hacerlo de una vez. */
function actionFor(slug: TutorialSlug, businessId: number): { href: string; label: string } {
  if (slug === 'dias-de-votacion') return { href: `/properties/${businessId}/voting-groups/plans`, label: 'Ver planes' };
  return { href: `/properties/${businessId}/voting-groups`, label: 'Ir a Votaciones' };
}

export function TutorialsLibrary({ businessId }: { businessId: number }) {
  const [failed, setFailed] = useState<Set<TutorialSlug>>(new Set());

  // Un video a la vez: al darle play a uno se pausan los demás.
  const pauseOthers = (current: HTMLVideoElement) => {
    document.querySelectorAll<HTMLVideoElement>('[data-tutorial-video]').forEach((v) => {
      if (v !== current && !v.paused) v.pause();
    });
  };

  return (
    <div className={`min-h-[calc(100vh-57px)] ${votingFontRoot}`} style={{ background: VT.paper, color: VT.ink }}>
      <div className="px-3 sm:px-8 py-4 md:py-7 flex flex-col gap-6 w-full max-w-5xl">
        <div>
          <div className={`${vtMono} text-[11px] uppercase tracking-[.06em]`} style={{ color: VT.muted }}>Ayuda</div>
          <h1 className="m-0 mt-1.5 text-xl md:text-2xl font-semibold tracking-[-.02em]">Tutoriales</h1>
          <p className="m-0 mt-1 text-[14px] max-w-2xl" style={{ color: VT.inkSoft }}>
            Aprende a hacer una asamblea completa en Rupü: seis videos cortos, con voz, en el orden en que se hace.
          </p>
        </div>

        <nav aria-label="Índice de tutoriales">
          <ol className="m-0 p-0 list-none flex flex-wrap gap-2">
            {TUTORIAL_ORDER.map((slug, i) => (
              <li key={slug}>
                <a
                  href={`#${slug}`}
                  className="inline-flex items-center gap-2 h-9 pl-1.5 pr-3.5 rounded-full bg-white text-[13px] font-medium hover:shadow-sm transition-shadow"
                  style={{ border: `1px solid ${VT.border}` }}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-bold text-white" style={{ background: VT.ink }} aria-hidden>
                    {i + 1}
                  </span>
                  {TUTORIALS[slug].title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {TUTORIAL_ORDER.map((slug, i) => {
          const tutorial = TUTORIALS[slug];
          const action = actionFor(slug, businessId);
          return (
            <section
              key={slug}
              id={slug}
              aria-labelledby={`${slug}-title`}
              className="scroll-mt-24 bg-white rounded-[14px] p-3 sm:p-4 grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start"
              style={{ border: `1px solid ${VT.border}` }}
            >
              {failed.has(slug) ? (
                <VtNotice tone="info">El video todavía no está disponible. Sigue los pasos de al lado.</VtNotice>
              ) : (
                <video
                  data-tutorial-video
                  src={tutorialVideo(slug)}
                  poster={tutorialPoster(slug)}
                  controls
                  preload="none"
                  playsInline
                  aria-label={`Video: ${tutorial.title}`}
                  className="w-full rounded-lg bg-black aspect-video"
                  onPlay={(e) => pauseOthers(e.currentTarget)}
                  onError={() => setFailed((cur) => new Set(cur).add(slug))}
                />
              )}
              <div className="flex flex-col gap-3 md:py-2">
                <div>
                  <div className={`${vtMono} text-[11px] uppercase tracking-[.06em]`} style={{ color: VT.muted }}>
                    Paso {i + 1} de {TUTORIAL_ORDER.length}
                  </div>
                  <h2 id={`${slug}-title`} className="m-0 mt-1 text-[17px] font-semibold">{tutorial.title}</h2>
                </div>
                <ul className="m-0 pl-5 text-[14px] leading-relaxed" style={{ color: VT.inkSoft }}>
                  {tutorial.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
                <div>
                  <Link href={action.href} className={vtBtn.secondary}>{action.label}</Link>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
