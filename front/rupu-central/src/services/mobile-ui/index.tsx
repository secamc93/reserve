'use client';

/**
 * Utilidades de diseño de teléfono para las pantallas de los módulos (< 768px, breakpoint `md`).
 * Solo presentación: no conoce dominio ni hace peticiones. Candidato a mudarse a `src/shared/ui`.
 */

import { useSyncExternalStore, type ReactNode } from 'react';

const PHONE_QUERY = '(max-width: 767px)';

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(PHONE_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** true en teléfono (< md). En el servidor y en el primer render del cliente es false (escritorio). */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );
}

/** Tarjeta apilada para reemplazar una fila de tabla en teléfono. */
export function MobileCard({
  title,
  subtitle,
  badge,
  fields,
  actions,
  onClick,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  /** Pares etiqueta/valor; se muestran en 2 columnas. */
  fields?: Array<{ label: string; value: ReactNode; full?: boolean }>;
  actions?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      className={`w-full min-w-0 text-left ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-900 text-base truncate" title={typeof title === 'string' ? title : undefined}>
            {title}
          </div>
          {subtitle && (
            <div className="text-sm text-gray-500 truncate" title={typeof subtitle === 'string' ? subtitle : undefined}>
              {subtitle}
            </div>
          )}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>
      {fields && fields.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
          {fields.map((f) => (
            <div key={f.label} className={`min-w-0 ${f.full ? 'col-span-2' : ''}`}>
              <dt className="text-[11px] uppercase tracking-wide text-gray-400">{f.label}</dt>
              <dd className="text-sm text-gray-800 truncate" title={typeof f.value === 'string' ? f.value : undefined}>
                {f.value ?? '-'}
              </dd>
            </div>
          ))}
        </dl>
      )}
      {actions && (
        <div className="mt-3 flex flex-wrap gap-2 [&>*]:min-h-[44px]" onClick={(e) => e.stopPropagation()}>
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * Columna única para la `Table` compartida en teléfono: cada fila se pinta como tarjeta.
 * Uso: `columns={isMobile ? mobileColumn('Unidades', (row) => <MobileCard … />) : columns}`.
 */
export function mobileColumn<T>(label: string, render: (row: T, index: number) => ReactNode) {
  return [{ key: '__mobile_card', label, render: (_: unknown, row: T, index: number) => render(row, index) }];
}

/** Botón de acción táctil (>= 44px) para tarjetas y barras de teléfono. */
export function MobileActionButton({
  children,
  onClick,
  variant = 'secondary',
  title,
  disabled,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  title?: string;
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    primary: 'bg-[var(--color-primary,#1E88E5)] text-white border-transparent',
    secondary: 'bg-white text-gray-700 border-gray-300',
    danger: 'bg-white text-red-600 border-red-200',
  }[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      className={`min-h-[44px] min-w-[44px] px-3 inline-flex items-center justify-center gap-1.5 rounded-lg border text-sm font-medium disabled:opacity-50 ${styles} ${className}`}
    >
      {children}
    </button>
  );
}
