'use client';

/**
 * Patrón C · Detalle ("PH - Visitas y Paquetes", V3/P3): panel lateral de 460 px a la derecha
 * sobre la lista atenuada, con cabecera (rótulo mono, avatar, título y datos), secciones
 * rotuladas en mono y acciones abajo. En teléfono ocupa toda la pantalla.
 * Candidato a subir a shared/ui/ds (DsSidePanel + DsTimeline).
 */

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { DS, DsEyebrow, VtIcon, dsFontRoot, dsMono } from '@/shared/ui/ds';
import type { TimelineStep } from './visit-state';

export function SidePanel({
  open,
  onClose,
  eyebrow,
  title,
  subtitle,
  status,
  avatar,
  children,
  footer,
  busy = false,
  width = 460,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  status?: ReactNode;
  /** Avatar o bloque a la izquierda del título (iniciales, unidad en grande…). */
  avatar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  busy?: boolean;
  width?: number;
}) {
  const titleId = useId();
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-[55] ${dsFontRoot}`}>
      <div className="absolute inset-0 bg-[rgba(245,245,244,.72)]" onClick={() => !busy && onClose()} aria-hidden="true" />
      <aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute right-0 top-0 h-full w-full md:w-[var(--panel-w)] bg-white flex flex-col outline-none shadow-[-12px_0_40px_rgba(0,0,0,.12)]"
        style={{ color: DS.ink, borderLeft: `1px solid ${DS.border}`, ['--panel-w' as string]: `${width}px` }}
      >
        <header className="px-5 md:px-6 pt-4 pb-4 border-b border-[#efedea] flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <DsEyebrow>{eyebrow}</DsEyebrow>
            <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Cerrar detalle"
            className="w-8 h-8 max-md:w-11 max-md:h-11 -mr-2 flex items-center justify-center text-[#8a8580] hover:text-[#1a1a1a] disabled:opacity-40"
          >
            <VtIcon name="close" size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            {avatar}
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="m-0 text-lg font-semibold tracking-[-.015em] leading-tight">
                {title}
              </h2>
              {subtitle && <div className="text-xs mt-0.5 text-[#8a8580]">{subtitle}</div>}
            </div>
          </div>
          {status && <div>{status}</div>}
        </header>
        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-4 flex flex-col gap-5">{children}</div>
        {footer && (
          <footer className="border-t border-[#efedea] px-5 md:px-6 py-3.5 pb-[calc(.875rem+env(safe-area-inset-bottom))] flex flex-wrap gap-2 max-md:[&>*]:flex-1">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}

/** Sección rotulada del panel. */
export function PanelSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section aria-label={label}>
      <DsEyebrow className="mb-2">{label}</DsEyebrow>
      {children}
    </section>
  );
}

/** Pares rótulo/valor en dos columnas. */
export function FieldGrid({ items }: { items: { label: string; value: ReactNode; mono?: boolean; full?: boolean }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      {items.map((i) => (
        <div key={i.label} className={i.full ? 'col-span-2' : ''}>
          <dt className="text-[11px] text-[#8a8580]">{i.label}</dt>
          <dd className={`m-0 text-[13px] font-medium break-words ${i.mono ? dsMono : ''}`}>{i.value || '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

const toneColor = { ok: DS.yes, danger: DS.no, muted: DS.ink } as const;

/** Línea de tiempo vertical (pasos hechos en tinta, pendientes con borde punteado). */
export function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol className="m-0 p-0 list-none">
      {steps.map((s, i) => {
        const color = s.done ? toneColor[s.tone ?? 'muted'] : DS.pendingBorder;
        return (
          <li key={s.key} className="relative pl-6 pb-4 last:pb-0">
            {i < steps.length - 1 && (
              <span className="absolute left-[4.5px] top-3.5 bottom-0 w-px" style={{ background: s.done ? DS.borderStrong : DS.border }} aria-hidden="true" />
            )}
            <span
              className="absolute left-0 top-1 w-[10px] h-[10px] rounded-full"
              style={s.done ? { background: color } : { border: `1.5px dashed ${color}`, background: '#fff' }}
              aria-hidden="true"
            />
            <div className="flex items-baseline justify-between gap-3">
              <span className={`text-[13px] ${s.done ? 'font-semibold' : 'text-[#8a8580]'}`}>{s.label}</span>
              <span className={`${dsMono} text-[11px] text-[#8a8580] whitespace-nowrap`}>{s.at || (s.done ? '' : 'Pendiente')}</span>
            </div>
            {s.detail && <div className="text-xs text-[#8a8580] mt-0.5">{s.detail}</div>}
          </li>
        );
      })}
    </ol>
  );
}
