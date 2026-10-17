/**
 * Piezas de interfaz del sistema de diseño de propiedad horizontal (nacieron en votaciones,
 * "Votaciones - Flujo completo"): diálogo de 560 px, botones, campos, interruptor, badge,
 * menú y avisos. Las usan todos los módulos.
 */

'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { DS as VT } from './tokens';
import { votingFontRoot, vtMono } from './fonts';

// ===================== Clases =====================

/** Pie de diálogo: a la derecha en escritorio; en teléfono, botones a ancho completo repartidos. */
export const vtDialogFooter = 'flex flex-wrap justify-end gap-2 pt-4 max-md:flex-nowrap max-md:[&>*]:flex-1 max-md:[&>*]:min-w-0';

export const vtBtn = {
  primary:
    'inline-flex items-center justify-center gap-1.5 h-9 max-md:h-11 max-md:text-sm px-4 rounded-[7px] text-[13px] font-semibold text-white bg-[#1a1a1a] transition-colors hover:bg-[#c8603f] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#1a1a1a]',
  secondary:
    'inline-flex items-center justify-center gap-1.5 h-9 max-md:h-11 max-md:text-sm px-3.5 rounded-[7px] text-[13px] font-medium bg-white text-[#1a1a1a] border border-[#d6d3cd] transition-colors hover:bg-[#f5f5f4] disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'inline-flex items-center justify-center gap-1.5 h-9 max-md:h-11 max-md:text-sm px-3.5 rounded-[7px] text-[13px] font-medium bg-white text-[#4b4a46] border border-[#d6d3cd] transition-colors hover:bg-[#f5f5f4] disabled:opacity-50 disabled:cursor-not-allowed',
  accent:
    'inline-flex items-center justify-center gap-1.5 h-8 max-md:h-11 px-3 rounded-md text-[13px] font-semibold bg-white text-[#c8603f] border border-[#c8603f] transition-colors hover:bg-[#fbe9e4] disabled:opacity-50 disabled:cursor-not-allowed',
  icon:
    'inline-flex items-center justify-center h-8 w-8 max-md:h-11 max-md:w-11 rounded-md bg-white text-[#4b4a46] border border-[#d6d3cd] transition-colors hover:bg-[#f5f5f4] disabled:opacity-50 disabled:cursor-not-allowed',
  small:
    'inline-flex items-center justify-center gap-1.5 h-[30px] max-md:h-11 max-md:text-[13px] px-3 rounded-md text-xs font-medium bg-white text-[#1a1a1a] border border-[#d6d3cd] transition-colors hover:bg-[#f5f5f4] disabled:opacity-50 disabled:cursor-not-allowed',
} as const;

export const vtInput =
  'w-full h-10 max-md:h-11 max-md:text-base rounded-[7px] border border-[#d6d3cd] bg-white px-3 text-sm text-[#1a1a1a] placeholder:text-[#8a8580] outline-none transition-colors focus:border-[#1a1a1a] disabled:bg-[#f5f5f4]';

export const vtTextarea =
  'w-full rounded-[7px] border border-[#d6d3cd] bg-white px-3 py-2.5 text-sm max-md:text-base text-[#1a1a1a] placeholder:text-[#8a8580] outline-none transition-colors focus:border-[#1a1a1a] resize-none';

export const vtLabel = 'block text-xs font-semibold mb-1.5 text-[#1a1a1a]';

// ===================== Íconos =====================

const paths: Record<string, string> = {
  close: 'M6 18L18 6M6 6l12 12',
  back: 'M15 19l-7-7 7-7',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.4-9.4a2 2 0 112.8 2.8L11.8 15H9v-2.8l8.6-8.6z',
  trash: 'M19 7l-.9 12.1A2 2 0 0116.1 21H7.9a2 2 0 01-2-1.9L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  up: 'M18 15l-6-6-6 6',
  down: 'M6 9l6 6 6-6',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  check: 'M5 13l4 4L19 7',
  calendar: 'M3 10h18M8 3v4M16 3v4',
  eye: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.5 12C3.7 7.9 7.5 5 12 5s8.3 2.9 9.5 7c-1.2 4.1-5 7-9.5 7s-8.3-2.9-9.5-7z',
};

export function VtIcon({ name, size = 16, strokeWidth = 2 }: { name: keyof typeof paths | 'qr' | 'more'; size?: number; strokeWidth?: number }) {
  if (name === 'qr') {
    return (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <path d="M14 14h3v3M21 14v7h-7" />
      </svg>
    );
  }
  if (name === 'more') {
    return (
      <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

// ===================== Diálogo =====================

interface VtDialogProps {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
  /** Evita cerrar con Escape o clic afuera (p. ej. mientras guarda). */
  busy?: boolean;
  /** Capa (z-index) del diálogo. */
  layer?: 'base' | 'over';
}

export function VtDialog({ open, onClose, eyebrow, title, subtitle, children, footer, width = 560, busy = false, layer = 'base' }: VtDialogProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, busy, onClose]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 ${layer === 'over' ? 'z-[75]' : 'z-[60]'} flex items-end md:items-center justify-center overflow-y-auto p-0 md:p-4 bg-black/45 ${votingFontRoot}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="bg-white w-full rounded-t-2xl md:rounded-lg p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-7 flex flex-col gap-4 md:gap-5 shadow-[0_12px_40px_rgba(0,0,0,.18)] outline-none md:my-auto max-md:max-h-[92dvh] max-md:overflow-y-auto"
        style={{ maxWidth: width, color: VT.ink }}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="min-w-0">
            {eyebrow && (
              <div className={`${vtMono} text-[11px] font-medium tracking-[.06em] mb-1.5 uppercase`} style={{ color: VT.muted }}>
                {eyebrow}
              </div>
            )}
            <h2 id={titleId} className="m-0 text-lg md:text-xl font-semibold tracking-[-.015em]">
              {title}
            </h2>
            {subtitle && (
              <div className="text-[13px] mt-0.5" style={{ color: VT.muted }}>
                {subtitle}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex items-center justify-center max-md:w-11 max-md:h-11 max-md:-mr-2 max-md:-mt-2 shrink-0 hover:text-[#1a1a1a] transition-colors disabled:opacity-40"
            style={{ color: VT.muted }}
            aria-label="Cerrar"
          >
            <VtIcon name="close" size={20} />
          </button>
        </div>
        {children}
        {footer && (
          <div className={vtDialogFooter} style={{ borderTop: `1px solid ${VT.border}` }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ===================== Interruptor =====================

interface VtSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
  /** Guardando el cambio en el servidor (aria-busy): el estado mostrado aún no está confirmado. */
  busy?: boolean;
}

/** Interruptor accesible (role="switch"); `label` es su nombre accesible. */
export function VtSwitch({ checked, onChange, label, disabled, busy = false }: VtSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-busy={busy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative w-[38px] h-[22px] rounded-full flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#c8603f]"
      style={{ background: checked ? VT.ink : VT.borderStrong }}
    >
      <span
        className="absolute top-[3px] w-4 h-4 rounded-full bg-white transition-[left] duration-150"
        style={{ left: checked ? 19 : 3 }}
      />
    </button>
  );
}

// ===================== Badge =====================

export function VtBadge({ label, bg, fg, size = 'sm' }: { label: string; bg: string; fg: string; size?: 'xs' | 'sm' }) {
  return (
    <span
      className={`inline-flex items-center rounded font-semibold whitespace-nowrap ${size === 'xs' ? 'px-[7px] py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'}`}
      style={{ background: bg, color: fg }}
    >
      {label}
    </span>
  );
}

// ===================== Menú "más acciones" =====================

export interface VtMenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export function VtMenu({ label, items, size = 30 }: { label: string; items: VtMenuItem[]; size?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center rounded-md bg-white border border-[#d6d3cd] text-[#4b4a46] hover:bg-[#f5f5f4] max-md:w-11! max-md:h-11!"
        style={{ width: size, height: size }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
      >
        <VtIcon name="more" size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="menu"
            aria-label={label}
            className="absolute right-0 top-[calc(100%+4px)] z-20 w-52 rounded-lg bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,.12)]"
            style={{ border: `1px solid ${VT.border}` }}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={`w-full text-left px-3 py-2 max-md:py-3 max-md:text-sm text-[13px] disabled:opacity-50 disabled:cursor-not-allowed ${item.danger ? 'hover:bg-[#fbe9e4]' : 'hover:bg-[#f5f5f4]'}`}
                style={{ color: item.danger ? VT.live : VT.ink }}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ===================== Mensajes =====================

export function VtNotice({ tone = 'error', children }: { tone?: 'error' | 'ok' | 'info'; children: ReactNode }) {
  const palette =
    tone === 'error'
      ? { bg: '#fbe9e4', fg: '#9c3a22', border: '#f1cfc4' }
      : tone === 'ok'
        ? { bg: VT.reachedBg, fg: VT.reachedFg, border: '#c7e3d2' }
        : { bg: VT.paper, fg: VT.inkSoft, border: VT.border };
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className="rounded-lg px-3.5 py-2.5 text-[13px] leading-snug"
      style={{ background: palette.bg, color: palette.fg, border: `1px solid ${palette.border}` }}
    >
      {children}
    </div>
  );
}
