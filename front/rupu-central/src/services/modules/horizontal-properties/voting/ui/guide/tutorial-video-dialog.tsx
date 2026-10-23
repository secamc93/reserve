/**
 * Ventana con el video tutorial de un paso y sus puntos clave.
 */

'use client';

import { useState } from 'react';
import { VtDialog, VtNotice, vtBtn } from '../design';
import { TUTORIALS, tutorialPoster, tutorialVideo, type TutorialSlug } from './tutorials';

export function TutorialVideoDialog({ slug, onClose }: { slug: TutorialSlug | null; onClose: () => void }) {
  const [failed, setFailed] = useState(false);
  const tutorial = slug ? TUTORIALS[slug] : null;
  return (
    <VtDialog
      open={tutorial !== null}
      onClose={() => { setFailed(false); onClose(); }}
      eyebrow="Video tutorial"
      title={tutorial?.title ?? ''}
      width={820}
      footer={<button type="button" className={vtBtn.primary} onClick={() => { setFailed(false); onClose(); }}>Entendido</button>}
    >
      {tutorial && (
        <div className="flex flex-col gap-3">
          {failed ? (
            <VtNotice tone="info">El video todavía no está disponible. Sigue los pasos de abajo.</VtNotice>
          ) : (
            <video
              key={tutorial.slug}
              src={tutorialVideo(tutorial.slug)}
              poster={tutorialPoster(tutorial.slug)}
              controls
              autoPlay
              playsInline
              aria-label={`Video: ${tutorial.title}`}
              className="w-full rounded-lg bg-black aspect-video"
              onError={() => setFailed(true)}
            />
          )}
          <ul className="m-0 pl-5 text-[14px] leading-relaxed">
            {tutorial.points.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
      )}
    </VtDialog>
  );
}
