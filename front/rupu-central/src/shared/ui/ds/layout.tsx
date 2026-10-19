/**
 * Patrones de pantalla del sistema de diseño de propiedad horizontal ("PH - Mapa del producto"):
 *  - Patrón A · Lista: cabecera secundaria (pestañas en píldora + acciones), chips de filtro,
 *    buscador y tabla densa con encabezados en mono.
 *  - Patrón C · Detalle: panel con secciones rotuladas en mono.
 * La barra superior flotante (propiedad · pestañas del módulo · usuario) la pone el layout de
 * propiedad horizontal; `DsSectionHeader` sube ahí sus pestañas en escritorio.
 */

'use client';

import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useTopBarSlot } from '../top-bar-slot';
import { DESKTOP_MEDIA_QUERY, useMediaQuery } from '../use-media-query';
import { dsFontRoot, dsMono } from './fonts';
import { DS } from './tokens';

// ===================== Página =====================

/** Contenedor de una pantalla: tipografía del sistema y fondo papel. */
export function DsPage({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`${dsFontRoot} min-h-full text-[#1a1a1a] ${className}`} style={{ background: DS.paper }}>
      {children}
    </div>
  );
}

/** Cuerpo de la pantalla debajo de la cabecera secundaria. */
export function DsBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`px-4 md:px-8 pt-5 pb-7 flex flex-col gap-3.5 ${className}`}>{children}</div>;
}

// ===================== Cabecera secundaria =====================

export interface DsTab<T extends string = string> {
  id: T;
  label: string;
  /** Se muestra como "Asignaciones · 138". */
  count?: string | number | null;
}

/**
 * Cabecera secundaria (52 px, fondo #efedea): pestañas en píldora a la izquierda y acciones a
 * la derecha. Sin pestañas sirve como barra de título + acciones.
 *
 * En escritorio con la barra superior flotante, las pestañas (submenús del módulo) suben a la
 * barra en una píldora y aquí quedan solo las acciones, alineadas a la derecha.
 */
export function DsSectionHeader<T extends string>({
  tabs,
  active,
  onChange,
  title,
  actions,
  ariaLabel = 'Secciones',
}: {
  tabs?: DsTab<T>[];
  active?: T;
  onChange?: (id: T) => void;
  /** Título cuando la pantalla no tiene pestañas. */
  title?: ReactNode;
  actions?: ReactNode;
  ariaLabel?: string;
}) {
  const topBarSlot = useTopBarSlot();
  const isDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const hasTabs = !!tabs && tabs.length > 0;

  if (tabs && hasTabs && topBarSlot && isDesktop) {
    return (
      <>
        {createPortal(
          <div
            role="tablist"
            aria-label={ariaLabel}
            className={`${dsFontRoot} max-w-full h-[52px] p-[7px] rounded-full bg-white border border-[#e4e2dd] shadow-[0_1px_2px_rgba(0,0,0,.04),0_4px_14px_rgba(0,0,0,.05)] flex items-center gap-0.5 overflow-x-auto`}
          >
            {tabs.map((tab) => {
              const on = tab.id === active;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => onChange?.(tab.id)}
                  className={`h-9 px-4 rounded-full text-[13px] inline-flex items-center whitespace-nowrap transition-colors ${
                    on ? 'text-white font-semibold shadow-sm' : 'text-[#4b4a46] font-medium hover:bg-[#f5f5f4] hover:text-[#1a1a1a]'
                  }`}
                  style={on ? { backgroundColor: 'var(--color-primary)' } : undefined}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count !== null && tab.count !== '' && <span className="whitespace-pre">{` · ${tab.count}`}</span>}
                </button>
              );
            })}
          </div>,
          topBarSlot,
        )}
        {actions && <div className="flex flex-wrap items-center justify-end gap-2 px-8 pt-4">{actions}</div>}
      </>
    );
  }

  return (
    <div className="min-h-[52px] bg-[#efedea] border-b border-[#e4e2dd] flex flex-wrap md:flex-nowrap items-center gap-1 px-4 md:px-6 py-2 md:py-0">
      {hasTabs ? (
        <div role="tablist" aria-label={ariaLabel} className="flex items-center gap-1 overflow-x-auto max-w-full -mx-1 px-1">
          {tabs.map((tab) => {
            const on = tab.id === active;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => onChange?.(tab.id)}
                className={`h-9 px-3.5 rounded-[7px] text-[13px] inline-flex items-center whitespace-nowrap transition-colors ${
                  on ? 'bg-white text-[#1a1a1a] font-semibold shadow-[0_1px_2px_rgba(0,0,0,.08),0_2px_6px_rgba(0,0,0,.06)]' : 'text-[#6b6a66] font-medium hover:text-[#1a1a1a]'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count !== null && tab.count !== '' && <span className="whitespace-pre">{` · ${tab.count}`}</span>}
              </button>
            );
          })}
        </div>
      ) : (
        title && <div className="text-[15px] font-semibold tracking-[-.01em]">{title}</div>
      )}
      {actions && <div className="ml-auto flex flex-wrap items-center gap-2 py-1 md:py-0">{actions}</div>}
    </div>
  );
}


// ===================== Filtros =====================

export interface DsChip<T extends string = string> {
  id: T;
  label: string;
  count?: string | number | null;
}

/** Chips de filtro: el activo en tinta, los demás en texto suave. */
export function DsChips<T extends string>({
  chips,
  active,
  onChange,
  ariaLabel = 'Filtros',
}: {
  chips: DsChip<T>[];
  active: T;
  onChange: (id: T) => void;
  ariaLabel?: string;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-1">
      {chips.map((chip) => {
        const on = chip.id === active;
        return (
          <button
            key={chip.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(chip.id)}
            className={`px-2.5 py-[5px] rounded-[5px] text-xs font-medium transition-colors ${
              on ? 'bg-[#1a1a1a] text-white' : 'text-[#4b4a46] hover:bg-[#e9e7e2]'
            }`}
          >
            {chip.label}
            {chip.count !== undefined && chip.count !== null && chip.count !== '' && <span className="whitespace-pre">{` · ${chip.count}`}</span>}
          </button>
        );
      })}
    </div>
  );
}

/** Buscador compacto de las listas. */
export function DsSearch({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = '',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <label className={`flex items-center gap-2 h-[30px] max-md:h-11 px-2.5 border border-[#d6d3cd] rounded-md bg-white text-[#8a8580] text-xs w-full md:w-60 focus-within:border-[#1a1a1a] ${className}`}>
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="flex-1 min-w-0 bg-transparent outline-none text-[#1a1a1a] placeholder:text-[#8a8580] max-md:text-base"
      />
    </label>
  );
}

/** Fila de filtros: chips a la izquierda, buscador / leyenda a la derecha. */
export function DsToolbar({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
      <div className="min-w-0">{left}</div>
      {right && <div className="flex items-center gap-3">{right}</div>}
    </div>
  );
}

// ===================== Tabla densa =====================

export interface DsColumn<T> {
  key: string;
  label: ReactNode;
  /** Ancho de la columna en el grid ("90px", "1fr", "minmax(120px,1fr)"). */
  width: string;
  align?: 'left' | 'right' | 'center';
  render: (row: T) => ReactNode;
}

/**
 * Tabla densa: tarjeta blanca, encabezados en mono (10 px, gris) y filas de 13 px separadas
 * por líneas suaves. En pantallas angostas se desplaza horizontalmente.
 */
export function DsTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  selectedKey,
  loading,
  empty = 'Sin registros',
  minWidth = 860,
  footer,
  ariaLabel,
}: {
  columns: DsColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  selectedKey?: string | number | null;
  loading?: boolean;
  empty?: ReactNode;
  minWidth?: number;
  footer?: ReactNode;
  ariaLabel?: string;
}) {
  const template = columns.map((c) => c.width).join(' ');
  const align = (a?: 'left' | 'right' | 'center') => (a === 'right' ? 'text-right justify-end' : a === 'center' ? 'text-center justify-center' : '');
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
          ) : rows.length === 0 ? (
            <div className="px-[18px] py-10 text-center text-sm text-[#8a8580]">{empty}</div>
          ) : (
            rows.map((row) => {
              const key = rowKey(row);
              const selected = selectedKey !== undefined && selectedKey === key;
              return (
                <div
                  key={key}
                  role="row"
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={`grid gap-3.5 px-[18px] py-2.5 items-center border-b border-[#efedea] last:border-b-0 text-[13px] ${
                    onRowClick ? 'cursor-pointer hover:bg-[#faf9f7]' : ''
                  } ${selected ? 'bg-[#f5f5f4]' : ''}`}
                  style={{ gridTemplateColumns: template }}
                >
                  {columns.map((c) => (
                    <div key={c.key} role="cell" className={`min-w-0 flex items-center ${align(c.align)}`}>{c.render(row)}</div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>
      {footer && <div className="border-t border-[#efedea] px-[18px] py-2">{footer}</div>}
    </div>
  );
}

// ===================== Piezas pequeñas =====================

/** Rótulo de sección en mono ("ASIGNADO A", "VEHÍCULO"). */
export function DsEyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`${dsMono} text-[10px] font-medium tracking-[.06em] uppercase text-[#8a8580] ${className}`}>{children}</div>;
}

/** Placa de vehículo / código en recuadro. */
export function DsPlate({ children, size = 'sm' }: { children: ReactNode; size?: 'sm' | 'lg' }) {
  return size === 'lg' ? (
    <span className={`${dsMono} px-2.5 py-1.5 border-[1.5px] border-[#1a1a1a] rounded-md text-base font-semibold tracking-[.04em]`}>{children}</span>
  ) : (
    <span className={`${dsMono} px-2 py-[3px] border border-[#d6d3cd] rounded-[5px] text-xs font-semibold tracking-[.04em] w-max`}>{children}</span>
  );
}

/** Estado con punto de color ("● Dentro"). */
export function DsStatus({ label, color, dot = true }: { label: ReactNode; color: string; dot?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
      {dot && <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: color }} />}
      {label}
    </span>
  );
}

/** Etiqueta de atributo ("Carro", "Cubierto"); `strong` la pinta en tinta. */
export function DsTag({ children, strong = false }: { children: ReactNode; strong?: boolean }) {
  return (
    <span className={`px-2 py-[3px] rounded text-[11px] ${strong ? 'bg-[#1a1a1a] text-white' : 'border border-[#d6d3cd]'}`}>{children}</span>
  );
}

/** Tarjeta blanca del sistema. */
export function DsCard({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`bg-white border border-[#e4e2dd] rounded-[10px] ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Leyenda de colores ("■ Libre ■ Ocupado"). */
export function DsLegend({ items }: { items: { label: string; swatch: CSSProperties }[] }) {
  return (
    <div className="flex flex-wrap gap-3.5 text-[11px] text-[#4b4a46]">
      {items.map((i) => (
        <span key={i.label} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={i.swatch} />
          {i.label}
        </span>
      ))}
    </div>
  );
}
