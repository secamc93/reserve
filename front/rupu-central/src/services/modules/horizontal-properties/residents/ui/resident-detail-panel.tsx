/**
 * R3 · Detalle del residente (Patrón C: panel lateral de 420 px): unidad, tipo y estado,
 * contacto, ocupación y línea de tiempo. Acciones: editar y eliminar.
 */

'use client';

import { useEffect, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { DS, DsStatus, DsTag, VtNotice, vtBtn } from '@shared/ui/ds';
import { getResidentByIdAction } from '../infrastructure/actions';
import type { Resident } from '../domain';
import { buildResidentTimeline, formatMoney, formatShortDate } from '../domain';
import { formatUnitLabel } from '../../units/domain';
import { DsField, DsPanelSection, DsSidePanel, DsTimeline } from '../../units/ui/kit';

export function ResidentDetailPanel({
  businessId,
  resident,
  onClose,
  onEdit,
  onDelete,
}: {
  businessId: number;
  /** Fila del listado (trae el bloque de la unidad). */
  resident: Resident | null;
  onClose: () => void;
  onEdit: (resident: Resident) => void;
  onDelete: (resident: Resident) => void;
}) {
  const [detail, setDetail] = useState<Resident | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resident) return;
    let cancelled = false;
    setDetail(null);
    setError(null);
    setLoading(true);
    (async () => {
      try {
        const token = TokenStorage.getBusinessToken();
        if (!token) throw new Error('token');
        const full = await getResidentByIdAction({ businessId, residentId: resident.id, token });
        if (!cancelled) setDetail(full);
      } catch {
        if (!cancelled) setError('No se pudo cargar el detalle del residente');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [businessId, resident]);

  if (!resident) return null;
  const r = detail ?? resident;
  const unitLabel = formatUnitLabel(r.propertyUnitNumber || resident.propertyUnitNumber, resident.propertyUnitBlock);
  const hasLease = Boolean(r.leaseStartDate || r.leaseEndDate || r.monthlyRent);

  return (
    <DsSidePanel
      open
      onClose={onClose}
      eyebrow={`Residente · ${unitLabel}`}
      title={r.name}
      subtitle={
        <span className="inline-flex flex-wrap items-center gap-2 mt-1">
          <DsTag>{r.residentTypeName || 'Residente'}</DsTag>
          {r.isMainResident && <DsTag strong>Principal</DsTag>}
          <DsStatus label={r.isActive ? 'Activo' : 'Inactivo'} color={r.isActive ? DS.yes : DS.muted} />
        </span>
      }
      footer={
        <>
          <button type="button" className={vtBtn.ghost} onClick={() => onDelete(resident)}>Eliminar</button>
          <button type="button" className={vtBtn.primary} onClick={() => onEdit(resident)}>Editar</button>
        </>
      }
    >
      {error && <VtNotice>{error}</VtNotice>}

      <DsPanelSection label="Unidad">
        <DsField label="Unidad">{unitLabel}</DsField>
        <DsField label="Rol">{r.isMainResident ? 'Residente principal' : 'Residente'}</DsField>
      </DsPanelSection>

      <DsPanelSection label="Contacto">
        <DsField label="Documento" mono>{r.dni || '—'}</DsField>
        <DsField label="Email">{r.email ? <a className="underline" href={`mailto:${r.email}`}>{r.email}</a> : '—'}</DsField>
        <DsField label="Teléfono" mono>{r.phone ? <a className="underline" href={`tel:${r.phone}`}>{r.phone}</a> : '—'}</DsField>
        <DsField label="Emergencia">{loading ? '…' : r.emergencyContact || '—'}</DsField>
      </DsPanelSection>

      {(hasLease || r.moveInDate || r.moveOutDate) && (
        <DsPanelSection label="Ocupación">
          {r.moveInDate && <DsField label="Ingreso" mono>{formatShortDate(r.moveInDate) || '—'}</DsField>}
          {r.moveOutDate && <DsField label="Salida" mono>{formatShortDate(r.moveOutDate) || '—'}</DsField>}
          {r.leaseStartDate && <DsField label="Inicio arriendo" mono>{formatShortDate(r.leaseStartDate) || '—'}</DsField>}
          {r.leaseEndDate && <DsField label="Fin arriendo" mono>{formatShortDate(r.leaseEndDate) || '—'}</DsField>}
          {r.monthlyRent ? <DsField label="Canon mensual" mono>{formatMoney(r.monthlyRent)}</DsField> : null}
        </DsPanelSection>
      )}

      <DsPanelSection label="Línea de tiempo">
        {loading ? (
          <div className="text-[13px] text-[#8a8580]">Cargando…</div>
        ) : (
          <DsTimeline items={detail ? buildResidentTimeline(detail) : []} empty="Sin fechas registradas" />
        )}
      </DsPanelSection>
    </DsSidePanel>
  );
}
