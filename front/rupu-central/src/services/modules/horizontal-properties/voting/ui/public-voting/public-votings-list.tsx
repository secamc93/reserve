/**
 * R2 · Votaciones del grupo (residente). La abierta va destacada con "Votar ahora".
 * Se actualiza sola (consulta periódica) cuando el administrador abre o cierra un punto.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Spinner } from '@shared/ui';
import { getGroupVotingsAction, type GroupVoting } from '@/services/modules/horizontal-properties/voting/infrastructure/actions/public-voting';
import { VT, VtIcon, VtNotice, canViewPublicResult, closedVotingLabel, formatOrder, initialsOf, publicVotingRowState, sortPublicVotings, votingFontRoot, vtMono } from '../design';

/** Cada cuánto se refresca la lista (ms). */
const REFRESH_MS = 5000;

interface PublicVotingsListProps {
  votingAuthToken: string;
  residentData: { id: number; name: string; unitNumber: string };
  onSelectVoting: (votingId: number, voting: GroupVoting, totalVotings: number) => void;
  onError: (error: string) => void;
}

export function PublicVotingsList({ votingAuthToken, residentData, onSelectVoting, onError }: PublicVotingsListProps) {
  const [votings, setVotings] = useState<GroupVoting[]>([]);
  const [groupName, setGroupName] = useState<string>('');
  const [votesCount, setVotesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stale, setStale] = useState(false);
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const load = useCallback(
    async (first: boolean) => {
      try {
        const result = await getGroupVotingsAction({ votingAuthToken });
        if (!result.success || !result.data) throw new Error(result.error || 'Error al cargar votaciones');
        setVotings(result.data.votings || []);
        setGroupName(result.data.voting_group?.name || '');
        setVotesCount(result.data.user_votes_count || 0);
        setStale(false);
      } catch (err) {
        if (first) onErrorRef.current(err instanceof Error ? err.message : 'Error al cargar votaciones');
        else setStale(true);
      } finally {
        if (first) setLoading(false);
      }
    },
    [votingAuthToken]
  );

  useEffect(() => {
    load(true);
    const timer = setInterval(() => load(false), REFRESH_MS);
    return () => clearInterval(timer);
  }, [load]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${votingFontRoot}`} style={{ background: VT.paper }}>
        <Spinner size="lg" text="Cargando votaciones..." />
      </div>
    );
  }

  const ordered = sortPublicVotings(votings);
  const total = votings.length;

  return (
    <div className={`min-h-screen ${votingFontRoot}`} style={{ background: VT.paper, color: VT.ink }}>
      <div className="max-w-[480px] mx-auto min-h-screen flex flex-col p-[22px]">
        <div className={`${vtMono} flex justify-between items-center gap-3 text-[11px] font-medium tracking-[.06em]`} style={{ color: VT.muted }}>
          <span className="uppercase truncate">{groupName || 'Asamblea'}</span>
          <span>{residentData.unitNumber}</span>
        </div>

        <div className="mt-3.5 flex items-center gap-2.5 px-3 py-2.5 bg-white rounded-lg text-[13px]" style={{ border: `1px solid ${VT.border}` }}>
          <span className={`${vtMono} w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0`} style={{ background: '#efedea' }}>
            {initialsOf(residentData.name)}
          </span>
          <div className="leading-tight min-w-0">
            <div className="font-semibold truncate">{residentData.name}</div>
            <div className="text-xs" style={{ color: VT.muted }}>Unidad {residentData.unitNumber}</div>
          </div>
          <span className={`${vtMono} ml-auto text-[11px] font-medium whitespace-nowrap`} style={{ color: VT.muted }}>
            {votesCount}/{total} votos
          </span>
        </div>

        <h1 className="mt-6 mb-0 text-xl font-semibold tracking-[-.015em]">Puntos a votar</h1>

        <ul className="mt-3 mb-0 p-0 list-none flex flex-col gap-2" aria-label="Puntos a votar">
          {ordered.length === 0 && (
            <li className="bg-white rounded-[10px] px-4 py-6 text-center text-sm" style={{ border: `1px solid ${VT.border}`, color: VT.muted }}>
              Aún no hay puntos para votar.
            </li>
          )}
          {ordered.map((voting) => {
            const state = publicVotingRowState(voting);
            const canView = canViewPublicResult(voting);
            const viewButton = canView ? (
              <button
                type="button"
                onClick={() => onSelectVoting(voting.id, voting, total)}
                className="inline-flex items-center justify-center w-8 h-8 max-md:w-11 max-md:h-11 max-md:-mr-2 rounded-md flex-shrink-0 transition-colors hover:bg-[#efedea]"
                style={{ color: VT.inkSoft }}
                aria-label={`Ver resultado de ${voting.title}`}
                title="Ver resultado"
              >
                <VtIcon name="eye" size={16} />
              </button>
            ) : null;

            if (state === 'open') {
              return (
                <li
                  key={voting.id}
                  aria-label={voting.title}
                  className="bg-white rounded-[10px] px-4 py-3.5 flex flex-col gap-2.5"
                  style={{ border: `1.5px solid ${VT.yes}`, boxShadow: '0 0 0 4px rgba(31,138,76,.10)' }}
                >
                  <div className="flex justify-between items-center">
                    <span className={`${vtMono} text-[11px] font-medium`} style={{ color: VT.muted }}>{formatOrder(voting.display_order)}</span>
                    <LiveBadge />
                  </div>
                  <div className="text-base font-semibold leading-tight">{voting.title}</div>
                  <button
                    type="button"
                    onClick={() => onSelectVoting(voting.id, voting, total)}
                    className="h-11 rounded-lg text-white text-sm font-semibold"
                    style={{ background: VT.ink }}
                  >
                    Votar ahora
                  </button>
                </li>
              );
            }

            if (state === 'voted') {
              return (
                <li
                  key={voting.id}
                  aria-label={voting.title}
                  className="bg-white rounded-[10px] px-4 py-3 flex gap-3 items-center"
                  style={{ border: `1px solid ${voting.is_active ? VT.yes : VT.border}` }}
                >
                  <span className={`${vtMono} text-[11px] font-medium`} style={{ color: VT.muted }}>{formatOrder(voting.display_order)}</span>
                  <span className="text-sm flex-1 min-w-0" style={{ color: VT.ink }}>{voting.title}</span>
                  {voting.is_active && <LiveBadge compact />}
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap" style={{ color: VT.yes }}>
                    <VtIcon name="check" size={12} strokeWidth={3} />
                    Votaste
                  </span>
                  {viewButton}
                </li>
              );
            }

            // No abierta: atenuada, en gris
            return (
              <li
                key={voting.id}
                aria-label={voting.title}
                className="rounded-[10px] px-4 py-3 flex gap-3 items-center"
                style={{ background: '#ecebe8', border: `1px solid ${VT.border}`, color: VT.muted }}
              >
                <span className={`${vtMono} text-[11px] font-medium`}>{formatOrder(voting.display_order)}</span>
                <span className="text-sm flex-1 min-w-0" style={{ color: VT.muted }}>{voting.title}</span>
                <span
                  className={`${vtMono} text-[10px] font-medium tracking-[.04em] px-2 py-0.5 rounded-full whitespace-nowrap`}
                  style={{ background: '#fff', border: `1px solid ${VT.borderStrong}`, color: VT.muted }}
                >
                  {closedVotingLabel(voting)}
                </span>
                {viewButton}
              </li>
            );
          })}
        </ul>

        {stale && (
          <div className="mt-3">
            <VtNotice tone="info">Sin conexión por ahora; reintentando…</VtNotice>
          </div>
        )}

        <p className="mt-auto pt-8 mb-0 text-center text-xs" style={{ color: VT.muted }}>
          Esta pantalla se actualiza sola cuando el administrador abre un punto.
        </p>
      </div>
    </div>
  );
}

/** Etiqueta verde "EN VIVO" con un punto que late, como una transmisión al aire. */
function LiveBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      role="status"
      className={`${vtMono} inline-flex items-center gap-1.5 rounded-full font-semibold tracking-[.08em] whitespace-nowrap ${compact ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1'}`}
      style={{ background: VT.reachedBg, color: VT.reachedFg }}
    >
      <span className="relative flex w-2 h-2">
        <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping" style={{ background: VT.yes }} />
        <span className="relative inline-flex w-2 h-2 rounded-full" style={{ background: VT.yes }} />
      </span>
      EN VIVO
    </span>
  );
}
