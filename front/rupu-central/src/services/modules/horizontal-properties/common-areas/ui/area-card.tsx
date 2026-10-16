/**
 * Z1 · Tarjeta de zona común: tipo, estado, capacidad, reglas y horario semanal.
 */

'use client';

import Link from 'next/link';
import { DS, DsCard, DsEyebrow, DsStatus, DsTag, VtMenu, dsMono, vtBtn } from '@/shared/ui/ds';
import type { CommonAreaListDTO } from '../domain';
import { formatMoney, scheduleSummary } from './design';

export interface AreaCardProps {
  area: CommonAreaListDTO;
  reservationsHref: string;
  onEdit: () => void;
  onSchedule: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  busy?: boolean;
}

/** Reglas de la zona como etiquetas cortas. */
export function areaRules(area: CommonAreaListDTO): string[] {
  const rules: string[] = [];
  rules.push(area.requiresApproval ? 'Requiere aprobación' : 'Aprobación automática');
  rules.push(area.hourlyRate ? `${formatMoney(area.hourlyRate)} / hora` : 'Sin costo');
  if (area.requiresDeposit) rules.push(area.depositAmount ? `Depósito ${formatMoney(area.depositAmount)}` : 'Con depósito');
  if (area.allowsRecurring) rules.push('Permite recurrentes');
  if (area.hasEquipment) rules.push(area.equipmentDescription ? `Equipada · ${area.equipmentDescription}` : 'Equipada');
  return rules;
}

export function AreaCard({ area, reservationsHref, onEdit, onSchedule, onToggleActive, onDelete, busy }: AreaCardProps) {
  const schedule = scheduleSummary(area.schedules);
  return (
    <DsCard className={`p-[18px] flex flex-col gap-3.5 ${area.isActive ? '' : 'opacity-75'}`}>
      <article aria-label={area.name} className="flex flex-col gap-3.5 h-full">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <DsEyebrow>{area.typeName || 'Zona común'}</DsEyebrow>
            <h3 className="m-0 mt-1 text-base font-semibold tracking-[-.01em] truncate">{area.name}</h3>
            {area.location && <div className="text-xs text-[#8a8580] mt-0.5 truncate">{area.location}</div>}
          </div>
          <DsStatus label={area.isActive ? 'Activa' : 'Inactiva'} color={area.isActive ? DS.yes : DS.muted} />
        </div>

        <div className="flex items-end gap-5">
          <div>
            <div className={`${dsMono} text-[26px] leading-none font-semibold`}>{area.maxCapacity}</div>
            <div className="text-[11px] text-[#8a8580] mt-1">personas máx.</div>
          </div>
          {area.areaSqm ? (
            <div>
              <div className={`${dsMono} text-base leading-none font-medium`}>{area.areaSqm} m²</div>
              <div className="text-[11px] text-[#8a8580] mt-1">área</div>
            </div>
          ) : null}
        </div>

        <ul aria-label={`Reglas de ${area.name}`} className="flex flex-wrap gap-1.5 list-none m-0 p-0">
          {areaRules(area).map((rule) => (
            <li key={rule}>
              <DsTag>{rule}</DsTag>
            </li>
          ))}
        </ul>

        <div>
          <DsEyebrow>Horario</DsEyebrow>
          <div className={`${dsMono} text-xs mt-1 ${schedule === 'Sin horario' ? 'text-[#c8603f]' : 'text-[#4b4a46]'}`}>
            {schedule === 'Sin horario' ? 'Sin horario · no se puede reservar' : schedule}
          </div>
        </div>

        <div className="mt-auto pt-3 border-t border-[#efedea] flex items-center gap-2">
          <Link href={reservationsHref} className={vtBtn.small}>
            Ver reservas
          </Link>
          <button type="button" className={vtBtn.small} onClick={onEdit} disabled={busy}>
            Editar
          </button>
          <div className="ml-auto">
            <VtMenu
              label={`Más acciones de ${area.name}`}
              items={[
                { label: 'Horario y bloqueos', onSelect: onSchedule },
                { label: area.isActive ? 'Desactivar zona' : 'Activar zona', onSelect: onToggleActive, disabled: busy },
                { label: 'Eliminar zona', onSelect: onDelete, danger: true },
              ]}
            />
          </div>
        </div>
      </article>
    </DsCard>
  );
}
