/**
 * Recorrido guiado (product tour): oscurece la pantalla, ilumina un elemento real de la página y
 * explica para qué sirve en una tarjeta al lado. Los pasos sin `target` (o cuyo elemento no está
 * visible) se muestran como tarjeta centrada o se saltan. Esc cierra; ← → navegan.
 */

'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { VT, votingFontRoot, vtBtn, vtMono } from '../design';

export interface TourStep {
  id: string;
  /** Selector CSS del elemento a iluminar. Sin él, la tarjeta va centrada. */
  target?: string;
  /** Si el elemento no está (p. ej. aún no hay asambleas): `skip` lo salta, `center` lo explica centrado. */
  missing?: 'skip' | 'center';
  eyebrow?: string;
  title: string;
  body: ReactNode;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PAD = 8;
const CARD_W = 360;
const GAP = 14;

function findTarget(step: TourStep): HTMLElement | null {
  if (!step.target) return null;
  const el = document.querySelector<HTMLElement>(step.target);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return r.width > 4 && r.height > 4 ? el : null;
}

/** Pasos que se pueden mostrar ahora (los de `missing: 'skip'` sin elemento se quitan). */
export function visibleSteps(steps: TourStep[], exists: (step: TourStep) => boolean): TourStep[] {
  return steps.filter((s) => !s.target || s.missing === 'center' || exists(s));
}

/** Posición de la tarjeta: debajo del elemento si cabe, si no arriba, y siempre dentro de la ventana. */
export function placeCard(rect: Rect | null, cardH: number, vw: number, vh: number): { top: number; left: number } {
  const w = Math.min(CARD_W, vw - 32);
  if (!rect) return { top: Math.max(16, (vh - cardH) / 2), left: (vw - w) / 2 };
  const below = rect.top + rect.height + PAD + GAP;
  const above = rect.top - PAD - GAP - cardH;
  const top = below + cardH <= vh - 16 ? below : above >= 16 ? above : Math.max(16, vh - cardH - 16);
  const left = Math.min(Math.max(16, rect.left + rect.width / 2 - w / 2), vw - w - 16);
  return { top, left };
}

export function ProductTour({
  steps,
  open,
  onClose,
  finishLabel = 'Terminar',
  onFinish,
  label = 'Recorrido guiado',
}: {
  steps: TourStep[];
  open: boolean;
  /** Al cerrar (saltar, Esc o terminar). */
  onClose: () => void;
  finishLabel?: string;
  /** Acción del botón del último paso (además de cerrar). */
  onFinish?: () => void;
  label?: string;
}) {
  const [active, setActive] = useState<TourStep[]>([]);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardH, setCardH] = useState(220);
  const cardRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    setActive(visibleSteps(steps, (s) => !!findTarget(s)));
    setIndex(0);
  }, [open, steps]);

  const step = active[index];
  const last = index === active.length - 1;

  const measure = useCallback(() => {
    if (!step) return;
    const el = findTarget(step);
    if (!el) return setRect(null);
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  // Al cambiar de paso: llevar el elemento a la vista, medirlo y enfocar el botón principal.
  useEffect(() => {
    if (!open || !step) return;
    findTarget(step)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    measure();
    const t = setTimeout(measure, 350);
    primaryRef.current?.focus();
    return () => clearTimeout(t);
  }, [open, step, measure]);

  useEffect(() => {
    if (!open) return;
    let frame = 0;
    const onMove = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open, measure]);

  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight);
  }, [step, rect]);

  const next = useCallback(() => {
    if (last) {
      onClose();
      onFinish?.();
    } else setIndex((i) => i + 1);
  }, [last, onClose, onFinish]);
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, onClose, next, back]);

  if (!open || !step || typeof document === 'undefined') return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pos = placeCard(rect, cardH, vw, vh);

  return createPortal(
    <div className={`${votingFontRoot} fixed inset-0 z-[70]`} style={{ color: VT.ink }}>
      {/* Fondo oscuro con un hueco iluminado sobre el elemento (o todo oscuro si va centrado). */}
      {rect ? (
        <div
          aria-hidden
          className="fixed rounded-[14px] transition-all duration-300 ease-out pointer-events-none"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(4, 32, 31, .62), 0 0 0 3px #2CD8CC',
          }}
        />
      ) : (
        <div aria-hidden className="fixed inset-0" style={{ background: 'rgba(4, 32, 31, .62)' }} />
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-describedby={`tour-${step.id}-body`}
        className="fixed bg-white rounded-[16px] p-5 flex flex-col gap-3 transition-[top,left] duration-300 ease-out shadow-[0_24px_60px_-18px_rgba(0,0,0,.55)]"
        style={{ top: pos.top, left: pos.left, width: Math.min(CARD_W, vw - 32) }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className={`${vtMono} text-[11px] uppercase tracking-[.06em]`} style={{ color: VT.muted }}>
            {step.eyebrow ?? `Paso ${index + 1} de ${active.length}`}
          </span>
          <button type="button" className="text-[12px] underline" style={{ color: VT.muted }} onClick={onClose}>
            Saltar recorrido
          </button>
        </div>
        <h2 className="m-0 text-[18px] font-semibold leading-snug tracking-[-.01em]">{step.title}</h2>
        <div id={`tour-${step.id}-body`} className="text-[14px] leading-relaxed" style={{ color: VT.inkSoft }}>
          {step.body}
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="flex gap-1.5" aria-hidden>
            {active.map((s, i) => (
              <span
                key={s.id}
                className="h-1.5 rounded-full transition-all"
                style={{ width: i === index ? 18 : 6, background: i <= index ? '#18A0AE' : VT.border }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {index > 0 && (
              <button type="button" className={vtBtn.ghost} onClick={back}>
                Atrás
              </button>
            )}
            <button ref={primaryRef} type="button" className={vtBtn.primary} onClick={next}>
              {last ? finishLabel : index === 0 ? 'Empezar' : 'Siguiente'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
