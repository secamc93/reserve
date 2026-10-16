/**
 * Piezas del sistema de diseño que aún no están en shared/ui/ds (candidatas a subir):
 *  - DsSidePanel: Patrón C · Detalle, panel lateral de 420 px.
 *  - DsTimeline: línea de tiempo del panel de detalle.
 *  - DsStat: cifra de resumen sobre la tabla.
 *  - DsFileDrop: selector de archivo para importaciones.
 *  - dsSelect: select compacto de la barra de filtros.
 *  - DsConfirmDialog: confirmación destructiva (eliminar) con el diálogo del sistema.
 */

'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { DS, DsEyebrow, VtDialog, VtIcon, VtNotice, dsFontRoot, dsMono, vtBtn } from '@shared/ui/ds';

/** Select compacto (30 px) para la barra de filtros. */
export const dsSelect =
  'h-[30px] max-md:h-11 rounded-md border border-[#d6d3cd] bg-white px-2 text-xs max-md:text-base text-[#1a1a1a] outline-none focus:border-[#1a1a1a]';

// ===================== Panel lateral =====================

export function DsSidePanel({
  open,
  onClose,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  width = 420,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`fixed inset-0 z-[55] ${dsFontRoot}`}>
      <div className="absolute inset-0 bg-black/25" onClick={onClose} aria-hidden="true" />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute right-0 top-0 h-full w-full bg-white border-l border-[#e4e2dd] shadow-[0_12px_40px_rgba(0,0,0,.18)] flex flex-col outline-none"
        style={{ maxWidth: width, color: DS.ink }}
      >
        <header className="flex items-start justify-between gap-3 px-6 pt-5 pb-4 border-b border-[#efedea]">
          <div className="min-w-0">
            {eyebrow && <DsEyebrow className="mb-1.5">{eyebrow}</DsEyebrow>}
            <h2 id={titleId} className="m-0 text-lg font-semibold tracking-[-.015em] truncate">
              {title}
            </h2>
            {subtitle && <div className="text-[13px] mt-0.5 text-[#8a8580]">{subtitle}</div>}
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="shrink-0 text-[#8a8580] hover:text-[#1a1a1a] max-md:w-11 max-md:h-11 flex items-center justify-center">
            <VtIcon name="close" size={20} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">{children}</div>
        {footer && <footer className="px-6 py-4 border-t border-[#efedea] flex flex-wrap justify-end gap-2 max-md:[&>*]:flex-1">{footer}</footer>}
      </aside>
    </div>
  );
}

/** Sección rotulada del panel ("CONTACTO", "UNIDAD"). */
export function DsPanelSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <DsEyebrow>{label}</DsEyebrow>
      {children}
    </section>
  );
}

/** Par rótulo / valor dentro de una sección del panel. */
export function DsField({ label, children, mono = false }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4 text-[13px] py-1 border-b border-[#f3f2ef] last:border-b-0">
      <span className="text-[#8a8580] shrink-0">{label}</span>
      <span className={`text-right min-w-0 break-words ${mono ? dsMono : ''}`}>{children}</span>
    </div>
  );
}

// ===================== Línea de tiempo =====================

export interface DsTimelineItem {
  key: string;
  label: string;
  date: string;
  detail?: string;
  /** Evento futuro (p. ej. fin de arriendo): punto hueco. */
  upcoming?: boolean;
}

export function DsTimeline({ items, empty = 'Sin eventos' }: { items: DsTimelineItem[]; empty?: string }) {
  if (items.length === 0) return <div className="text-[13px] text-[#8a8580]">{empty}</div>;
  return (
    <ol className="relative flex flex-col gap-3.5 pl-5" aria-label="Línea de tiempo">
      <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-[#e4e2dd]" aria-hidden="true" />
      {items.map((item) => (
        <li key={item.key} className="relative">
          <span
            className="absolute -left-5 top-1 w-[11px] h-[11px] rounded-full border-2"
            style={{ borderColor: item.upcoming ? DS.pendingBorder : DS.ink, background: item.upcoming ? '#fff' : DS.ink }}
            aria-hidden="true"
          />
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] font-semibold">{item.label}</span>
            <span className={`${dsMono} text-[11px] text-[#8a8580] whitespace-nowrap`}>{item.date}</span>
          </div>
          {item.detail && <div className="text-xs text-[#8a8580] mt-0.5">{item.detail}</div>}
        </li>
      ))}
    </ol>
  );
}

// ===================== Cifras de resumen =====================

export function DsStat({ label, value, hint, tone = 'default' }: { label: string; value: ReactNode; hint?: ReactNode; tone?: 'default' | 'ok' | 'warn' }) {
  const hintColor = tone === 'ok' ? DS.reachedFg : tone === 'warn' ? DS.missingFg : DS.muted;
  return (
    <div className="bg-white border border-[#e4e2dd] rounded-[10px] px-4 py-3 min-w-0">
      <DsEyebrow>{label}</DsEyebrow>
      <div className={`${dsMono} text-[22px] font-semibold tracking-[-.02em] mt-1 tabular-nums`}>{value}</div>
      {hint && <div className="text-xs mt-0.5" style={{ color: hintColor }}>{hint}</div>}
    </div>
  );
}

// ===================== Selector de archivo =====================

export function DsFileDrop({
  file,
  onFile,
  accept = '.xlsx,.xls',
  disabled,
  hint = 'Excel .xlsx o .xls, hasta 10 MB',
}: {
  file: File | null;
  onFile: (file: File | null) => void;
  accept?: string;
  disabled?: boolean;
  hint?: string;
}) {
  const inputId = useId();
  return (
    <label
      htmlFor={inputId}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-6 text-center transition-colors ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[#1a1a1a] hover:bg-[#faf9f7]'
      } ${file ? 'border-[#1a1a1a] bg-[#faf9f7]' : 'border-[#c9c6c0]'}`}
    >
      <input
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        aria-label="Archivo Excel"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <>
          <span className="text-[13px] font-semibold break-all">{file.name}</span>
          <span className={`${dsMono} text-[11px] text-[#8a8580]`}>{(file.size / 1024).toFixed(1)} KB · clic para cambiar</span>
        </>
      ) : (
        <>
          <span className={vtBtn.small + ' pointer-events-none'}>Elegir archivo</span>
          <span className="text-xs text-[#8a8580]">{hint}</span>
        </>
      )}
    </label>
  );
}

/** Valida extensión (.xlsx/.xls) y tamaño (10 MB) de un Excel. Devuelve el error o null. */
export function validateExcelFile(file: File): string | null {
  const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
  if (!['.xlsx', '.xls'].includes(ext)) return 'El archivo debe ser .xlsx o .xls';
  if (file.size > 10 * 1024 * 1024) return 'El archivo debe pesar menos de 10 MB';
  return null;
}

// ===================== Confirmación =====================

export function DsConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  busy = false,
  error,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  error?: string | null;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <VtDialog
      open={open}
      onClose={onClose}
      busy={busy}
      width={440}
      layer="over"
      eyebrow="Confirmar"
      title={title}
      footer={
        <>
          <button type="button" className={vtBtn.secondary} onClick={onClose} disabled={busy}>Cancelar</button>
          <button
            type="button"
            className={`${vtBtn.primary} bg-[#c8382d]! hover:bg-[#a82e25]!`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Eliminando…' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="m-0 text-[13px] text-[#4b4a46]">{message}</p>
      {error && <VtNotice>{error}</VtNotice>}
    </VtDialog>
  );
}
