/**
 * Piezas de interfaz del sistema de diseño de propiedad horizontal (nacieron en votaciones,
 * "Votaciones - Flujo completo"): diálogo de 560 px, botones, campos, interruptor, badge,
 * menú y avisos. Las usan todos los módulos.
 */

'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { DS as VT } from './tokens';
import { votingFontRoot, vtMono } from './fonts';

// ===================== Clases =====================

/** Pie de diálogo: a la derecha en escritorio; en teléfono, botones a ancho completo repartidos. */
export const vtDialogFooter = 'flex flex-wrap justify-end gap-2 pt-4 max-md:flex-nowrap max-md:[&>*]:flex-1 max-md:[&>*]:min-w-0';

export const vtBtn = {
  primary:
    'inline-flex items-center justify-center gap-1.5 h-10 max-md:h-11 max-md:text-sm px-5 rounded-full text-[13px] font-semibold text-white bg-[#0F7F8A] shadow-[0_1px_2px_rgba(15,127,138,.18),0_4px_14px_rgba(15,127,138,.22)] transition-colors duration-200 hover:bg-[#0C6B76] disabled:opacity-45 disabled:shadow-none disabled:cursor-not-allowed disabled:hover:bg-[#0F7F8A]',
  secondary:
    'inline-flex items-center justify-center gap-1.5 h-10 max-md:h-11 max-md:text-sm px-4 rounded-full text-[13px] font-medium bg-white text-[#1a1a1a] border border-[#e4e2dd] shadow-[0_1px_2px_rgba(0,0,0,.04),0_4px_14px_rgba(0,0,0,.05)] transition-colors duration-200 hover:bg-[#f5f5f4] disabled:opacity-50 disabled:cursor-not-allowed',
  ghost:
    'inline-flex items-center justify-center gap-1.5 h-10 max-md:h-11 max-md:text-sm px-4 rounded-full text-[13px] font-medium bg-white text-[#4b4a46] border border-[#e4e2dd] transition-colors duration-200 hover:bg-[#f5f5f4] disabled:opacity-50 disabled:cursor-not-allowed',
  accent:
    'inline-flex items-center justify-center gap-1.5 h-9 max-md:h-11 px-4 rounded-full text-[13px] font-semibold bg-white text-[#c8603f] border border-[#c8603f] transition-colors hover:bg-[#fbe9e4] disabled:opacity-50 disabled:cursor-not-allowed',
  icon:
    'inline-flex items-center justify-center h-8 w-8 max-md:h-11 max-md:w-11 rounded-full bg-white text-[#4b4a46] border border-[#e4e2dd] transition-colors duration-200 hover:bg-[#f5f5f4] hover:text-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed',
  small:
    'inline-flex items-center justify-center gap-1.5 h-[30px] max-md:h-11 max-md:text-[13px] px-3.5 rounded-full text-xs font-medium bg-white text-[#1a1a1a] border border-[#e4e2dd] transition-colors hover:bg-[#f5f5f4] disabled:opacity-50 disabled:cursor-not-allowed',
} as const;

export const vtInput =
  'w-full h-10 max-md:h-11 max-md:text-base rounded-xl border border-[#d6d3cd] bg-white px-3.5 text-sm text-[#1a1a1a] placeholder:text-[#8a8580] outline-none transition-[border-color,box-shadow] focus:border-[#18A0AE] focus:shadow-[0_0_0_3px_rgba(24,160,174,.15)] disabled:bg-[#f5f5f4]';

export const vtTextarea =
  'w-full rounded-xl border border-[#d6d3cd] bg-white px-3.5 py-2.5 text-sm max-md:text-base text-[#1a1a1a] placeholder:text-[#8a8580] outline-none transition-[border-color,box-shadow] focus:border-[#18A0AE] focus:shadow-[0_0_0_3px_rgba(24,160,174,.15)] resize-none';

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
  eyeOff: 'M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.8 9.8 0 0112 5c4.5 0 8.3 2.9 9.5 7a9.7 9.7 0 01-2.6 4.1M6.6 6.6A9.7 9.7 0 002.5 12c1.2 4.1 5 7 9.5 7a9.7 9.7 0 005.4-1.6',
  lock: 'M7 11V7a5 5 0 0110 0v4M5 11h14v10H5z',
  unlock: 'M7 11V7a5 5 0 019.9-1M5 11h14v10H5z',
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
        className="bg-white w-full rounded-t-[24px] md:rounded-[24px] p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:p-7 flex flex-col gap-4 md:gap-5 shadow-[0_12px_40px_rgba(0,0,0,.18)] outline-none md:my-auto max-md:max-h-[92dvh] max-md:overflow-y-auto"
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
      className="relative w-[38px] h-[22px] rounded-full flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#18A0AE]"
      style={{ background: checked ? VT.brand : VT.borderStrong }}
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
      className={`inline-flex items-center rounded-full font-semibold whitespace-nowrap ${size === 'xs' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]'}`}
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

const MENU_WIDTH = 208;
const MENU_GAP = 4;

/**
 * El menú se pinta en un portal sobre `body` con posición fija: así un contenedor con
 * `overflow-hidden` (p. ej. la tarjeta de un grupo de votación) no lo recorta. Se abre hacia
 * arriba si no cabe debajo y se cierra al desplazar o redimensionar la ventana.
 */
export function VtMenu({ label, items, size = 30 }: { label: string; items: VtMenuItem[]; size?: number }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top?: number; bottom?: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const left = Math.max(8, rect.right - MENU_WIDTH);
      const estimatedHeight = items.length * 44 + 8;
      const fitsBelow = rect.bottom + MENU_GAP + estimatedHeight <= window.innerHeight;
      setPos(fitsBelow ? { top: rect.bottom + MENU_GAP, left } : { bottom: window.innerHeight - rect.top + MENU_GAP, left });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        className="inline-flex items-center justify-center rounded-full bg-white border border-[#e4e2dd] text-[#4b4a46] transition-colors hover:bg-[#f5f5f4] hover:text-[#1a1a1a] max-md:w-11! max-md:h-11!"
        style={{ width: size, height: size }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        title={label}
      >
        <VtIcon name="more" size={14} />
      </button>
      {open &&
        createPortal(
          <div
            role="menu"
            aria-label={label}
            className="fixed z-[70] w-52 rounded-2xl bg-white p-1 shadow-[0_8px_24px_rgba(0,0,0,.12)]"
            style={{ border: `1px solid ${VT.border}`, ...pos }}
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
                className={`w-full text-left rounded-xl px-3 py-2 max-md:py-3 max-md:text-sm text-[13px] disabled:opacity-50 disabled:cursor-not-allowed ${item.danger ? 'hover:bg-[#fbe9e4]' : 'hover:bg-[#f5f5f4]'}`}
                style={{ color: item.danger ? VT.live : VT.ink }}
              >
                {item.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[69]" onClick={() => setOpen(false)} aria-hidden="true" />,
          document.body,
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
      className="rounded-2xl px-4 py-2.5 text-[13px] leading-snug"
      style={{ background: palette.bg, color: palette.fg, border: `1px solid ${palette.border}` }}
    >
      {children}
    </div>
  );
}
