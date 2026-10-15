/**
 * A1 · Votaciones del grupo (filas del grupo expandido).
 * Cada fila: orden, título + estado, tipo/quórum, barra por coeficiente con el
 * marcador de quórum, % de la opción que va ganando y la acción principal
 * (En vivo / Iniciar / Configurar / Resultado) + menú de más acciones.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { getVotingDetailsAction, getVotingOptionsAction } from '../infrastructure/actions';
import { activateVotingAction } from '../infrastructure/actions/activate-voting.action';
import { deactivateVotingAction } from '../infrastructure/actions/deactivate-voting.action';
import type { Voting, VotingOption } from '../domain/entities';
import { VotingFormModal } from './voting-form-modal';
import { DeleteVotingModal } from './delete-voting-modal';
import { VotesDetailModal } from './votes-detail-modal';
import {
  StackedBar,
  VT,
  VtBadge,
  VtMenu,
  VtNotice,
  computeCoefficientResults,
  formatOrder,
  formatPct,
  getVotingStatus,
  getWinner,
  resolveQuorum,
  votingTypeLabel,
  vtBtn,
  vtMono,
  type CoefficientResults,
} from './design';

interface VotingsListProps {
  businessId: number;
  groupId: number;
  groupName: string;
  /** Votaciones del grupo (las carga la tarjeta del grupo). */
  votings: Voting[];
  /** Recarga las votaciones del grupo. */
  onReload: () => Promise<void> | void;
}

interface RowData {
  options: VotingOption[];
  results: CoefficientResults | null;
}

export const liveVotingPath = (businessId: number, groupId: number, votingId: number) =>
  `/properties/${businessId}/voting-groups/${groupId}/votings/${votingId}/live`;

export function VotingsList({ businessId, groupId, groupName, votings, onReload }: VotingsListProps) {
  const [rows, setRows] = useState<Record<number, RowData>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Voting | null>(null);
  const [deleting, setDeleting] = useState<Voting | null>(null);
  const [detail, setDetail] = useState<Voting | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRow = useCallback(
    async (voting: Voting) => {
      const token = TokenStorage.getBusinessToken();
      if (!token) return;
      const [optionsRes, detailsRes] = await Promise.all([
        getVotingOptionsAction({ token, businessId, groupId, votingId: voting.id }),
        getVotingDetailsAction({ token, businessId, votingGroupId: groupId, votingId: voting.id }),
      ]);
      const options = (optionsRes.success && optionsRes.data ? optionsRes.data : []).sort((a, b) => a.displayOrder - b.displayOrder);
      const results =
        detailsRes.success && detailsRes.data
          ? computeCoefficientResults(
              options.map((o) => ({ id: o.id, text: o.optionText, code: o.optionCode, color: o.color })),
              detailsRes.data.units.map((u) => ({
                hasVoted: u.has_voted,
                coef: u.participation_coefficient || 0,
                optionText: u.option_text,
              }))
            )
          : null;
      setRows((prev) => ({ ...prev, [voting.id]: { options, results } }));
    },
    [businessId, groupId]
  );

  useEffect(() => {
    votings.forEach((v) => loadRow(v));
  }, [votings, loadRow]);

  const reloadAll = async () => {
    await onReload();
  };

  const setActive = async (voting: Voting, active: boolean) => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return false;
    setBusyId(voting.id);
    setError(null);
    try {
      const action = active ? activateVotingAction : deactivateVotingAction;
      const res = await action({ token, businessId, groupId, votingId: voting.id });
      if (!res.success) {
        setError(res.error || 'No se pudo cambiar el estado de la votación');
        return false;
      }
      return true;
    } finally {
      setBusyId(null);
    }
  };

  const handlePrimary = async (voting: Voting, key: string) => {
    if (key === 'draft') {
      setEditing(voting);
      setFormOpen(true);
      return;
    }
    if (key === 'ready') {
      const ok = await setActive(voting, true);
      if (!ok) return;
    }
    // Navegación completa (como antes): con server actions en vuelo, router.push en `next dev`
    // a veces cambia la URL y deja renderizada la página anterior.
    window.location.assign(liveVotingPath(businessId, groupId, voting.id));
  };

  const nextOrder = votings.reduce((max, v) => Math.max(max, v.displayOrder), 0) + 1;

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-between items-center pb-1">
        <h3 className="m-0 text-[13px] font-semibold">
          Votaciones <span className="font-normal" style={{ color: VT.muted }}>· {votings.length}</span>
        </h3>
        <button
          type="button"
          className={vtBtn.small}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          + Nueva votación
        </button>
      </div>

      {error && <VtNotice>{error}</VtNotice>}

      {votings.length === 0 ? (
        <div className="rounded-lg py-8 text-center text-[13px] bg-white" style={{ border: `1px dashed ${VT.borderStrong}`, color: VT.muted }}>
          Aún no hay votaciones en este grupo.
        </div>
      ) : (
        <ul className="m-0 p-0 list-none flex flex-col gap-2.5" aria-label={`Votaciones de ${groupName}`}>
          {votings.map((voting) => {
            const row = rows[voting.id];
            const results = row?.results ?? null;
            const status = getVotingStatus({
              isActive: voting.isActive,
              optionsCount: row ? row.options.length : null,
              votedUnits: results ? results.votedUnits : null,
            });
            const quorum = resolveQuorum(voting.requiredPercentage);
            const winner = results ? getWinner(results.segments) : null;
            const hasVotes = !!results && results.votedUnits > 0;
            const metaParts = [
              votingTypeLabel(voting.votingType),
              `quórum ${quorum}%`,
              voting.allowAbstention ? 'abstención permitida' : 'sin abstención',
            ];
            if (voting.isSecret) metaParts.push('secreta');
            if (row && row.options.length === 0) metaParts.push('sin opciones aún');
            const votesText = hasVotes
              ? `${results!.votedUnits} / ${results!.totalUnits} votos`
              : status.key === 'draft'
                ? '0 opciones'
                : status.key === 'live'
                  ? `0 / ${results?.totalUnits ?? 0} votos`
                  : 'Sin iniciar';

            return (
              <li
                key={voting.id}
                aria-label={voting.title}
                className="bg-white rounded-lg px-4 sm:px-[18px] py-3.5 grid grid-cols-[32px_1fr_auto] lg:grid-cols-[32px_minmax(0,1fr)_minmax(180px,300px)_90px_auto] gap-x-[18px] gap-y-3 items-center"
                style={{ border: `1px solid ${VT.border}` }}
              >
                <div className={`${vtMono} text-[13px] font-medium`} style={{ color: VT.muted }}>
                  {formatOrder(voting.displayOrder)}
                </div>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold flex items-center gap-2.5 flex-wrap">
                    <span className="min-w-0">{voting.title}</span>
                    <VtBadge label={status.label} bg={status.bg} fg={status.fg} size="xs" />
                  </div>
                  <div className={`${vtMono} text-[11px] mt-[3px]`} style={{ color: VT.muted }}>
                    {metaParts.join(' · ')}
                  </div>
                </div>
                <div className="col-span-3 lg:col-span-1 row-start-2 lg:row-start-auto">
                  {hasVotes && results && (
                    <StackedBar segments={results.segments} quorum={quorum} height={10} radius={3} markerOverflow={4} />
                  )}
                  <div className={`${vtMono} text-[11px] mt-[5px]`} style={{ color: VT.muted }}>
                    {votesText}
                  </div>
                </div>
                <div
                  className={`${vtMono} hidden lg:block text-right text-xl leading-none font-semibold tracking-[-.03em]`}
                  style={{ color: winner ? winner.color : VT.pendingBorder }}
                  title={winner ? `${winner.label}: ${formatPct(winner.pct)}% del coeficiente` : 'Sin votos'}
                >
                  {winner ? `${formatPct(winner.pct)}%` : '—'}
                </div>
                <div className="flex gap-1.5 items-center justify-end">
                  <button
                    type="button"
                    disabled={busyId === voting.id}
                    onClick={() => handlePrimary(voting, status.key)}
                    className="h-[30px] px-3 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap transition-colors disabled:opacity-60"
                    style={
                      status.primary
                        ? { background: VT.ink, color: '#fff', border: `1px solid ${VT.ink}` }
                        : { background: '#fff', color: VT.ink, border: `1px solid ${VT.borderStrong}` }
                    }
                    aria-label={`${status.action}: ${voting.title}`}
                  >
                    {status.primary && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: VT.accent }} />}
                    {busyId === voting.id ? '…' : status.action}
                  </button>
                  <VtMenu
                    label={`Más acciones de ${voting.title}`}
                    items={[
                      {
                        label: 'Editar votación y opciones',
                        onSelect: () => {
                          setEditing(voting);
                          setFormOpen(true);
                        },
                      },
                      voting.isActive
                        ? { label: 'Cerrar votación', onSelect: async () => (await setActive(voting, false)) && reloadAll() }
                        : {
                            label: 'Abrir votación',
                            disabled: row?.options.length === 0,
                            onSelect: async () => (await setActive(voting, true)) && reloadAll(),
                          },
                      { label: 'Ver votos', onSelect: () => setDetail(voting) },
                      { label: 'Eliminar votación', danger: true, onSelect: () => setDeleting(voting) },
                    ]}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <VotingFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={reloadAll}
        businessId={businessId}
        groupId={groupId}
        groupName={groupName}
        nextOrder={nextOrder}
        voting={editing}
      />

      {deleting && (
        <DeleteVotingModal
          isOpen={!!deleting}
          onClose={() => setDeleting(null)}
          onSuccess={() => {
            setDeleting(null);
            reloadAll();
          }}
          businessId={businessId}
          groupId={groupId}
          voting={deleting}
        />
      )}

      {detail && (
        <VotesDetailModal
          isOpen={!!detail}
          onClose={() => setDetail(null)}
          businessId={businessId}
          groupId={groupId}
          votingId={detail.id}
          votingTitle={detail.title}
          options={rows[detail.id]?.options ?? []}
        />
      )}
    </div>
  );
}
