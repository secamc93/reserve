/**
 * Barra superior compacta del teléfono (< 768 px; oculta en escritorio): logo pequeño y nombre de
 * la propiedad activa, con `actions` opcionales a la derecha. El selector de propiedad vive en el
 * menú de módulos (barra inferior).
 */

'use client';

import type { ReactNode } from 'react';
import { PropertyLogo } from './property-logo';
import type { ActiveProperty } from '../utils/navigation';

export interface MobileTopBarProps {
  property: ActiveProperty | null;
  fallbackName?: string;
  actions?: ReactNode;
}

export function MobileTopBar({ property, fallbackName = 'Rupü', actions }: MobileTopBarProps) {
  const name = property?.name ?? fallbackName;
  return (
    <header
      role="banner"
      className="sticky top-0 z-20 flex h-14 items-center gap-3 px-4 text-white shadow-sm md:hidden"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      <PropertyLogo name={name} logoUrl={property?.logoUrl} size={32} />
      <p className="min-w-0 flex-1 truncate text-base font-semibold">{name}</p>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  );
}
