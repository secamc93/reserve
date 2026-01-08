/**
 * Componente Badge reutilizable
 * Usa clases globales definidas en globals.css
 */

'use client';

import { ReactNode, HTMLAttributes } from 'react';

type BadgeColor = 'primary' | 'success' | 'error' | 'warning' | 'secondary' | 'info' | 'danger';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  type?: BadgeColor;
  color?: BadgeColor;
  size?: BadgeSize;
  children: ReactNode;
  className?: string;
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-xs px-1.5 py-0.5',
  md: 'text-sm px-2 py-0.5',
  lg: 'text-base px-3 py-1',
};

// Mapeo de colores a clases (para colores que no tienen clase en globals.css)
const colorClasses: Record<string, string> = {
  info: 'bg-blue-100 text-blue-800',
  danger: 'bg-red-100 text-red-800',
};

export function Badge({ 
  type, 
  color, 
  size = 'md', 
  children, 
  className = '', 
  ...props 
}: BadgeProps) {
  // `color` tiene prioridad sobre `type` para compatibilidad
  const badgeColor = color || type || 'primary';
  
  // Usar clase de globals.css o clase personalizada
  const hasGlobalClass = ['primary', 'success', 'error', 'warning', 'secondary'].includes(badgeColor);
  const colorClass = hasGlobalClass 
    ? `badge badge-${badgeColor}` 
    : `badge ${colorClasses[badgeColor] || ''}`;
  
  const sizeClass = sizeClasses[size];
  
  return (
    <span className={`${colorClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </span>
  );
}

