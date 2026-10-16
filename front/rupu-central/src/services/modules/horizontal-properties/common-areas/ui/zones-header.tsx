/**
 * Cabecera secundaria de Zonas comunes (Z1 y Z3): pestañas "Zonas · 6", "Calendario de
 * reservas", "Pendientes · 2", "Historial" y acciones a la derecha.
 */

'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { DsSectionHeader } from '@/shared/ui/ds';

export type ZonesTab = 'zones' | 'calendar' | 'pending' | 'history';

export function zonesTabHref(businessId: number, tab: ZonesTab): string {
  const base = `/properties/${businessId}/common-areas`;
  if (tab === 'zones') return base;
  if (tab === 'calendar') return `${base}/reservations`;
  return `${base}/reservations?tab=${tab === 'pending' ? 'pendientes' : 'historial'}`;
}

export function ZonesHeader({
  businessId,
  active,
  zonesCount,
  pendingCount,
  actions,
  onTab,
}: {
  businessId: number;
  active: ZonesTab;
  zonesCount?: number | null;
  pendingCount?: number | null;
  actions?: ReactNode;
  /** Si se pasa, cambia de pestaña sin navegar (dentro de la misma pantalla). */
  onTab?: (tab: ZonesTab) => boolean | void;
}) {
  const router = useRouter();
  return (
    <DsSectionHeader<ZonesTab>
      ariaLabel="Zonas comunes"
      tabs={[
        { id: 'zones', label: 'Zonas', count: zonesCount ?? null },
        { id: 'calendar', label: 'Calendario de reservas' },
        { id: 'pending', label: 'Pendientes', count: pendingCount ?? null },
        { id: 'history', label: 'Historial' },
      ]}
      active={active}
      onChange={(tab) => {
        if (tab === active) return;
        if (onTab && onTab(tab) === true) return;
        router.push(zonesTabHref(businessId, tab));
      }}
      actions={actions}
    />
  );
}
