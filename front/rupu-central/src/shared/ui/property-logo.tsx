/**
 * Logo redondo de la propiedad activa. Sin logo (o si la imagen falla): círculo blanco con las
 * iniciales en el color primario de la propiedad (`--color-primary`).
 */

'use client';

import { useState } from 'react';
import { getInitials } from '../utils/navigation';

export interface PropertyLogoProps {
  name: string;
  logoUrl?: string;
  /** Diámetro en px (por defecto 56). */
  size?: number;
  className?: string;
}

export function PropertyLogo({ name, logoUrl, size = 56, className = '' }: PropertyLogoProps) {
  const [failed, setFailed] = useState(false);
  const showImage = !!logoUrl && !failed;

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-white font-bold ${className}`}
      style={{ width: size, height: size, color: 'var(--color-primary)', fontSize: Math.round(size * 0.36) }}
      data-testid="property-logo"
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
}
