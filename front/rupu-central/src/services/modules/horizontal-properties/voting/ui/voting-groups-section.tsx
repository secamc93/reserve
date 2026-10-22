/**
 * A1 · Grupos de votación (/voting-groups).
 * Lista de grupos con el activo expandido: cabecera con estado, periodo, quórum,
 * número de votaciones y asistencia; acciones QR, Asistencia, editar y eliminar.
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Spinner } from '@shared/ui';
import { TokenStorage } from '@shared/config';
import { getVotingGroupsAction, getVotingsAction } from '../infrastructure/actions';
import { listAttendanceListsAction, getAttendanceListSummaryAction } from '../../attendance/infrastructure/actions';
import { getHorizontalPropertyByIdAction } from '../../properties/infrastructure/actions';
import type { Voting, VotingGroup } from '../domain/entities';
import { VotingGroupFormModal } from './voting-group-form-modal';
import { DeleteVotingGroupModal } from './delete-voting-group-modal';
import { VotingsList } from './votings-list';
import { GroupQRModal } from './components/group-qr-modal';
import { VotingBillingBanner } from './voting-billing-banner';
import { useGroupQr, useVotingCapabilities, GROUP_QR_VALID_HOURS } from './hooks';
import {
  VT,
  VtBadge,
  VtIcon,
  VtMenu,
  VtNotice,
  formatDateRange,
  getGroupStatus,
  votingFontRoot,
  vtBtn,
  vtMono,
} from './design';

interface VotingGroupsSectionProps {
  businessId: number;
}

export function VotingGroupsSection({ businessId }: VotingGroupsSectionProps) {
  const [groups, setGroups] = useState<VotingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const caps = useVotingCapabilities();
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<VotingGroup | null>(null);
  const [deleting, setDeleting] = useState<VotingGroup | null>(null);
  const [propertyName, setPropertyName] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    setError(null);
    const token = TokenStorage.getBusinessToken();
    if (!token) {
      setError('Selecciona un negocio para ver sus grupos de votación.');
      setLoading(false);
      return;
    }
    try {
      const result = await getVotingGroupsAction({ token, businessId });
      if (!result.success || !result.data) throw new Error(result.error || 'No se pudieron cargar los grupos');
      const list = [...result.data].sort((a, b) => new Date(b.votingStartDate).getTime() - new Date(a.votingStartDate).getTime());
      setGroups(list);
      // El primer grupo activo queda expandido (si el usuario aún no abrió ninguno).
      setExpanded((prev) => {
        if (prev.size > 0) return prev;
        const active = list.find((g) => getGroupStatus(g).key === 'active');
        return active ? new Set([active.id]) : prev;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar los grupos');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadGroups();
    const token = TokenStorage.getBusinessToken();
    if (token) {
      getHorizontalPropertyByIdAction({ token, id: businessId })
        .then((res) => setPropertyName(res.success && res.data ? res.data.name : null))
        .catch(() => setPropertyName(null));
    }
  }, [businessId, loadGroups]);

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className={`min-h-[calc(100vh-57px)] ${votingFontRoot}`} style={{ background: VT.paper, color: VT.ink }}>
      <div className="px-3 sm:px-8 py-4 md:py-7 flex flex-col gap-4 md:gap-5 w-full">
        <div className="flex flex-wrap justify-between items-end gap-3">
          <div>
            <div className={`${vtMono} text-[11px] font-medium tracking-[.06em] mb-1.5 uppercase`} style={{ color: VT.muted }}>
              Propiedad horizontal{propertyName ? ` · ${propertyName}` : ''}
            </div>
            <h1 className="m-0 text-xl md:text-2xl font-semibold tracking-[-.02em]">Grupos de votación</h1>
          </div>
          {caps.canManage && (
            <button
              type="button"
              className={`${vtBtn.primary} max-md:w-full`}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              + Nuevo grupo
            </button>
          )}
        </div>

        {error && <VtNotice>{error}</VtNotice>}

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="md" text="Cargando grupos de votación..." />
          </div>
        ) : groups.length === 0 ? (
          <div className="bg-white rounded-[10px] py-14 px-6 text-center" style={{ border: `1px solid ${VT.border}` }}>
            <h2 className="m-0 text-[17px] font-semibold">Aún no hay grupos de votación</h2>
            {caps.canManage && (
              <>
                <p className="mt-1.5 mb-5 text-[13px]" style={{ color: VT.muted }}>
                  Crea el grupo de la asamblea y agrega sus votaciones.
                </p>
                <button type="button" className={vtBtn.primary} onClick={() => setFormOpen(true)}>
                  + Nuevo grupo
                </button>
              </>
            )}
          </div>
        ) : (
          groups.map((group) => (
            <VotingGroupCard
              key={group.id}
              group={group}
              businessId={businessId}
              expanded={expanded.has(group.id)}
              onToggle={() => toggle(group.id)}
              onEdit={() => {
                setEditing(group);
                setFormOpen(true);
              }}
              onDelete={() => setDeleting(group)}
              canManage={caps.canManage}
              canViewLive={caps.canViewLive}
            />
          ))
        )}
      </div>

      <VotingGroupFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={loadGroups}
        businessId={businessId}
        group={editing}
      />

      <DeleteVotingGroupModal
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onSuccess={() => {
          setDeleting(null);
          loadGroups();
        }}
        businessId={businessId}
        group={deleting}
      />
    </div>
  );
}

// ===================== Tarjeta de grupo =====================

interface VotingGroupCardProps {
  group: VotingGroup;
  businessId: number;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  /** Editar/eliminar el grupo, QR y crear o iniciar votaciones (un consejero solo ve). */
  canManage: boolean;
  canViewLive: boolean;
}

function VotingGroupCard({ group, businessId, expanded, onToggle, onEdit, onDelete, canManage, canViewLive }: VotingGroupCardProps) {
  const [votings, setVotings] = useState<Voting[] | null>(null);
  const [attendance, setAttendance] = useState<{ attended: number; total: number } | null>(null);
  const [showQr, setShowQr] = useState(false);
  const qr = useGroupQr(businessId, group.id);
  const status = getGroupStatus(group);

  const loadVotings = useCallback(async () => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    const result = await getVotingsAction({ token, businessId, groupId: group.id });
    if (result.success && result.data) {
      setVotings([...result.data].sort((a, b) => a.displayOrder - b.displayOrder));
    } else {
      setVotings([]);
    }
  }, [businessId, group.id]);

  const loadAttendance = useCallback(async () => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    try {
      const lists = await listAttendanceListsAction({ token, businessId, votingGroupId: group.id });
      const raw = ((lists.success && lists.data) || []) as unknown as { id: number; is_active?: boolean }[];
      const list = [...raw].sort((a, b) => b.id - a.id).find((l) => l.is_active !== false) ?? raw[0];
      if (!list) return setAttendance(null);
      const summary = await getAttendanceListSummaryAction({ token, id: list.id });
      const data = summary.data as unknown as { attended_units?: number; total_units?: number } | undefined;
      if (summary.success && data) setAttendance({ attended: Number(data.attended_units) || 0, total: Number(data.total_units) || 0 });
    } catch {
      setAttendance(null);
    }
  }, [businessId, group.id]);

  useEffect(() => {
    loadVotings();
    loadAttendance();
  }, [loadVotings, loadAttendance]);

  const openQr = async () => {
    const data = qr.data ?? (await qr.generate());
    if (data) setShowQr(true);
  };

  const meta = useMemo(() => {
    const parts = [formatDateRange(group.votingStartDate, group.votingEndDate)];
    parts.push(group.requiresQuorum ? `quórum ${group.quorumPercentage}%` : 'sin quórum');
    if (group.requireDocumentValidation) parts.push('con documento');
    if (votings) parts.push(`${votings.length} ${votings.length === 1 ? 'votación' : 'votaciones'}`);
    parts.push(attendance ? `asistencia ${attendance.attended}/${attendance.total}` : 'sin lista de asistencia');
    return parts.join(' · ');
  }, [group, votings, attendance]);

  const closed = status.key === 'closed';
  // Teléfono: editar y eliminar van en un menú para que QR y Asistencia queden anchos y táctiles.
  const groupMenuItems = [
    { label: 'Editar grupo', onSelect: onEdit },
    { label: 'Eliminar grupo', danger: true, onSelect: onDelete },
  ];

  return (
    <section
      aria-label={`Grupo ${group.name}`}
      className="bg-white rounded-[10px] overflow-hidden"
      style={{ border: `1px solid ${VT.border}`, opacity: closed && !expanded ? 0.85 : 1, color: closed && !expanded ? VT.inkSoft : undefined }}
    >
      <div
        className="px-4 sm:px-[22px] py-[18px] grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-5 items-center"
        style={{ borderBottom: expanded ? `1px solid ${VT.border}` : undefined }}
      >
        <div className="flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="m-0 text-[17px] font-semibold tracking-[-.01em]">{group.name}</h2>
            <VtBadge label={status.label} bg={status.bg} fg={status.fg} />
          </div>
          <div className={`${vtMono} text-xs`} style={{ color: VT.muted }}>
            {meta}
          </div>
          {qr.error && <div className="text-xs" style={{ color: VT.live }}>{qr.error}</div>}
          {canManage && !closed && <VotingBillingBanner businessId={businessId} groupId={group.id} />}
        </div>
        <div className="flex gap-1.5 items-center flex-wrap max-md:flex-nowrap max-md:w-full max-md:[&>a]:flex-1 max-md:[&>a]:min-w-0 max-md:[&>button:not([aria-label])]:min-w-0 max-md:[&>button:not([aria-label])]:flex-1">
          {closed ? (
            <>
              {!expanded && (
                <button type="button" className={`${vtBtn.small} h-8 text-[13px]`} onClick={onToggle}>
                  Ver acta
                </button>
              )}
              {expanded && (
                <>
                  <Link href={`/properties/${businessId}/voting-groups/${group.id}/attendance`} className={`${vtBtn.small} h-8 text-[13px]`}>
                    Asistencia
                  </Link>
                  {canManage && (
                    <>
                      <button type="button" className={`${vtBtn.icon} max-md:hidden`} onClick={onEdit} aria-label={`Editar grupo ${group.name}`} title="Editar grupo">
                        <VtIcon name="edit" size={15} />
                      </button>
                      <button type="button" className={`${vtBtn.icon} max-md:hidden`} onClick={onDelete} aria-label={`Eliminar grupo ${group.name}`} title="Eliminar grupo">
                        <VtIcon name="trash" size={15} />
                      </button>
                      <div className="md:hidden">
                        <VtMenu label={`Más acciones del grupo ${group.name}`} items={groupMenuItems} />
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
          <>
          {canManage && (
            <button type="button" className={`${vtBtn.small} h-8 text-[13px]`} onClick={openQr} disabled={qr.loading}>
              <VtIcon name="qr" size={14} />
              {qr.loading ? 'Generando…' : 'QR'}
            </button>
          )}
          <Link href={`/properties/${businessId}/voting-groups/${group.id}/attendance`} className={`${vtBtn.small} h-8 text-[13px]`}>
            Asistencia
          </Link>
          {canManage && (
            <>
              <button type="button" className={`${vtBtn.icon} max-md:hidden`} onClick={onEdit} aria-label={`Editar grupo ${group.name}`} title="Editar grupo">
                <VtIcon name="edit" size={15} />
              </button>
              <button type="button" className={`${vtBtn.icon} max-md:hidden`} onClick={onDelete} aria-label={`Eliminar grupo ${group.name}`} title="Eliminar grupo">
                <VtIcon name="trash" size={15} />
              </button>
              <div className="md:hidden">
                <VtMenu label={`Más acciones del grupo ${group.name}`} items={groupMenuItems} />
              </div>
            </>
          )}
          </>
          )}
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex items-center justify-center h-8 w-8 max-md:h-11 max-md:w-11 rounded-md transition-colors hover:bg-[#e4e2dd]"
            style={{ background: '#efedea', color: VT.ink }}
            aria-expanded={expanded}
            aria-label={expanded ? `Contraer grupo ${group.name}` : `Expandir grupo ${group.name}`}
          >
            <VtIcon name={expanded ? 'up' : 'down'} size={15} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-3 sm:px-[22px] pt-4 pb-5" style={{ background: '#faf9f7' }}>
          {votings === null ? (
            <div className="flex justify-center py-8">
              <Spinner size="sm" text="Cargando votaciones..." />
            </div>
          ) : (
            <VotingsList
              businessId={businessId}
              groupId={group.id}
              groupName={group.name}
              votings={votings}
              onReload={loadVotings}
              canViewLive={canViewLive}
              canManage={canManage}
            />
          )}
        </div>
      )}

      {showQr && qr.data && (
        <GroupQRModal data={qr.data} validHours={GROUP_QR_VALID_HOURS} onClose={() => setShowQr(false)} />
      )}
    </section>
  );
}
