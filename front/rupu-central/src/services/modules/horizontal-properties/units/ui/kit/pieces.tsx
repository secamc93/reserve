/**
 * Piezas del sistema de diseño que aún no están en shared/ui/ds (candidatas a subir):
 *  - DsSidePanel: Patrón C · Detalle, panel lateral (420–460 px) con acciones en la cabecera.
 *  - DsGroupedTable: tabla densa con filas de grupo (p. ej. por bloque/torre).
 *  - DsAvatar: iniciales en mono dentro de un círculo.
 *  - DsFileDrop: selector de archivo para importaciones.
 *  - dsSelect: select compacto de la barra de filtros.
 *  - DsConfirmDialog: confirmación destructiva (eliminar) con el diálogo del sistema.
 */

'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import type { DsColumn } from '@shared/ui/ds';
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
  headerActions,
  width = 420,
}: {
  open: boolean;
  onClose: () => void;
  eyebrow?: ReactNode;
  /** Botones junto al cerrar (p. ej. "Editar"). */
  headerActions?: ReactNode;
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
          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            <button type="button" onClick={onClose} aria-label="Cerrar" className="shrink-0 text-[#8a8580] hover:text-[#1a1a1a] max-md:w-11 max-md:h-11 flex items-center justify-center">
              <VtIcon name="close" size={20} />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">{children}</div>
        {footer && <footer className="px-6 py-4 border-t border-[#efedea] flex flex-wrap justify-end gap-2 max-md:[&>*]:flex-1">{footer}</footer>}
      </aside>
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

// ===================== Avatar =====================

/** Iniciales de un nombre ("Ana María Pérez" → "AM"; "ROJAS" → "RO"). */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function DsAvatar({ name, size = 30 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className={`${dsMono} inline-flex items-center justify-center rounded-full bg-[#efedea] text-[#4b4a46] font-semibold shrink-0`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initialsOf(name)}
    </span>
  );
}

// ===================== Tabla agrupada =====================

export interface DsGroup<T> {
  key: string;
  /** Texto del grupo a la izquierda ("Casa · 156 unidades"). */
  label: ReactNode;
  /** Dato del grupo a la derecha, en mono ("coef. 79,410 %"). */
  right?: ReactNode;
  rows: T[];
}

/** Tabla densa con filas de grupo (fondo #faf9f7) antes de las filas de cada grupo. */
export function DsGroupedTable<T>({
  columns,
  groups,
  rowKey,
  onRowClick,
  loading,
  empty = 'Sin registros',
  minWidth = 860,
  footer,
  ariaLabel,
}: {
  columns: DsColumn<T>[];
  groups: DsGroup<T>[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  loading?: boolean;
  empty?: ReactNode;
  minWidth?: number;
  footer?: ReactNode;
  ariaLabel?: string;
}) {
  const template = columns.map((c) => c.width).join(' ');
  const align = (a?: 'left' | 'right' | 'center') => (a === 'right' ? 'text-right justify-end' : a === 'center' ? 'text-center justify-center' : '');
  const hasRows = groups.some((g) => g.rows.length > 0);
  return (
    <div className="bg-white border border-[#e4e2dd] rounded-[10px] overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <div role="table" aria-label={ariaLabel} style={{ minWidth }}>
          <div role="row" className={`${dsMono} grid gap-3.5 px-[18px] py-[9px] border-b border-[#efedea] text-[10px] font-medium tracking-[.06em] uppercase text-[#8a8580]`} style={{ gridTemplateColumns: template }}>
            {columns.map((c) => (
              <span key={c.key} role="columnheader" className={`flex ${align(c.align)}`}>{c.label}</span>
            ))}
          </div>
          {loading ? (
            <div className="px-[18px] py-10 text-center text-sm text-[#8a8580]">Cargando…</div>
          ) : !hasRows ? (
            <div className="px-[18px] py-10 text-center text-sm text-[#8a8580]">{empty}</div>
          ) : (
            groups.map((g) => (
              <div key={g.key} role="rowgroup" aria-label={typeof g.label === 'string' ? g.label : undefined}>
                <div role="row" className="flex items-center justify-between gap-3 px-[18px] py-2 bg-[#faf9f7] border-b border-[#efedea] text-xs">
                  <span role="cell" className="font-semibold text-[#1a1a1a]">{g.label}</span>
                  {g.right && <span role="cell" className={`${dsMono} text-[11px] text-[#4b4a46]`}>{g.right}</span>}
                </div>
                {g.rows.map((row) => (
                  <div
                    key={rowKey(row)}
                    role="row"
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={`grid gap-3.5 px-[18px] py-2.5 items-center border-b border-[#efedea] text-[13px] ${onRowClick ? 'cursor-pointer hover:bg-[#faf9f7]' : ''}`}
                    style={{ gridTemplateColumns: template }}
                  >
                    {columns.map((c) => (
                      <div key={c.key} role="cell" className={`min-w-0 flex items-center ${align(c.align)}`}>{c.render(row)}</div>
                    ))}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
      {footer && <div className="border-t border-[#efedea] px-[18px] py-2">{footer}</div>}
    </div>
  );
}
