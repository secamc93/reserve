/**
 * Página de tutoriales de un módulo: los videos en orden, cada uno en su apartado con los puntos
 * clave y un botón para hacerlo; arriba un índice (#slug) y "← Volver". Cada módulo pasa su lista.
 */

'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DS, VtNotice, dsFontRoot, dsMono, vtBtn } from './ds';

export interface TutorialItem {
  slug: string;
  title: string;
  points: string[];
  video: string;
  poster: string;
  action: { href: string; label: string };
}

export function TutorialsPage({
  heading,
  intro,
  backHref,
  items,
}: {
  heading: string;
  intro: ReactNode;
  /** Adónde vuelve "← Volver" si se entró directo (sin historial). */
  backHref: string;
  items: TutorialItem[];
}) {
  const router = useRouter();
  const [failed, setFailed] = useState<Set<string>>(new Set());

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(backHref);
  };

  // Un video a la vez: al darle play a uno se pausan los demás.
  const pauseOthers = (current: HTMLVideoElement) => {
    document.querySelectorAll<HTMLVideoElement>('[data-tutorial-video]').forEach((v) => {
      if (v !== current && !v.paused) v.pause();
    });
  };

  return (
    <div className={`min-h-[calc(100vh-57px)] ${dsFontRoot}`} style={{ background: DS.paper, color: DS.ink }}>
      <div className="px-3 sm:px-8 py-4 md:py-7 flex flex-col gap-6 w-full max-w-5xl">
        <div>
          <button type="button" onClick={goBack} className={`${dsMono} text-[11px] uppercase tracking-[.06em] hover:underline`} style={{ color: DS.muted }}>
            ← Volver
          </button>
          <h1 className="m-0 mt-1.5 text-xl md:text-2xl font-semibold tracking-[-.02em]">{heading}</h1>
          <p className="m-0 mt-1 text-[14px] max-w-2xl" style={{ color: DS.inkSoft }}>{intro}</p>
        </div>

        <nav aria-label="Índice de tutoriales">
          <ol className="m-0 p-0 list-none flex flex-wrap gap-2">
            {items.map(({ slug, title }, i) => (
              <li key={slug}>
                <a
                  href={`#${slug}`}
                  className="inline-flex items-center gap-2 h-9 pl-1.5 pr-3.5 rounded-full bg-white text-[13px] font-medium hover:shadow-sm transition-shadow"
                  style={{ border: `1px solid ${DS.border}` }}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] font-bold text-white" style={{ background: DS.ink }} aria-hidden>
                    {i + 1}
                  </span>
                  {title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {items.map((tutorial, i) => {
          const { slug, action } = tutorial;
          return (
            <section
              key={slug}
              id={slug}
              aria-labelledby={`${slug}-title`}
              className="scroll-mt-24 bg-white rounded-[14px] p-3 sm:p-4 grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start"
              style={{ border: `1px solid ${DS.border}` }}
            >
              {failed.has(slug) ? (
                <VtNotice tone="info">El video todavía no está disponible. Sigue los pasos de al lado.</VtNotice>
              ) : (
                <video
                  data-tutorial-video
                  src={tutorial.video}
                  poster={tutorial.poster}
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
                  <div className={`${dsMono} text-[11px] uppercase tracking-[.06em]`} style={{ color: DS.muted }}>
                    Paso {i + 1} de {items.length}
                  </div>
                  <h2 id={`${slug}-title`} className="m-0 mt-1 text-[17px] font-semibold">{tutorial.title}</h2>
                </div>
                <ul className="m-0 pl-5 text-[14px] leading-relaxed" style={{ color: DS.inkSoft }}>
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
