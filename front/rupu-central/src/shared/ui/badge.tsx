/**
 * Componente Badge reutilizable
 * Usa clases globales definidas en globals.css
 */

'use client';

import { ReactNode } from 'react';

type BadgeType = 'primary' | 'success' | 'error' | 'warning';

interface BadgeProps {
  type?: BadgeType;
  children: ReactNode;
}

export function Badge({ type = 'primary', children }: BadgeProps) {
  return (
    <span className={`badge badge-${type}`}>
      {children}
    </span>
  );
}

