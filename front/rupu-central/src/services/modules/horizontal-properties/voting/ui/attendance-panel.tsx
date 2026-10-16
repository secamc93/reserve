/**
 * A4 · Asistencia del grupo: marcar las unidades presentes.
 * Resumen por coeficiente con el marcador de quórum, filtros (Todas / Presentes /
 * Ausentes / Con poder), buscador y un interruptor por unidad.
 * Usa la lista de asistencia del grupo (endpoints existentes del módulo de asistencia).
 */

'use client';

import { fetchAllPages, pageSlice } from '@shared/utils/pagination';
import { Pagination, usePaginationParams } from '@shared/ui/pagination';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Spinner } from '@shared/ui';
import { DsBody, DsConfirmDialog, DsPage, DsSectionHeader, VtMenu } from '@shared/ui/ds';
import { TokenStorage } from '@shared/config';
import { getVotingGroupsAction, getVotingsAction, markUnitAttendanceAction } from '../infrastructure/actions';
import {
  generateAttendanceListAction,
  getAttendanceListRecordsAction,
  listAttendanceListsAction,
  exportAttendanceAction,
  markAttendanceSimpleAction,
  removeAttendanceListAction,
  unmarkAttendanceSimpleAction,
  type AttendanceExportKind,
  type RecordProxyData,
} from '../../attendance/infrastructure/actions';
import { AttendanceProxyDialog } from './attendance-proxy-dialog';
import { getPropertyUnitsAction } from '../../units/infrastructure/actions';
import { getResidentsAction } from '../../residents/infrastructure/actions';
import type { Voting, VotingGroup } from '../domain/entities';
import { liveVotingPath } from './votings-list';
import { VotingCredentialsActions } from './credentials/voting-credentials-actions';
import { VOTING_PASSWORDS_RESOURCE, permissionsInclude } from '@/services/auth/permissions/domain/entities';
import {
  DEFAULT_QUORUM_PERCENTAGE,
  VT,
  VtIcon,
  VtNotice,
  VtSwitch,
  buildAttendanceRows,
  filterAttendanceRows,
  formatCoef,
  formatPct,
  getQuorumStatus,
  setRowPresence,
  summarizeAttendance,
  vtBtn,
  vtMono,
  type AttendanceFilter,
  type AttendanceRecordRaw,
  type AttendanceRow,
} from './design';

interface AttendancePanelProps {
  businessId: number;
  groupId: number;
  /** Si se pasa (panel flotante), la cabecera muestra un botón para cerrarlo. */
  onClose?: () => void;
}

/** Tope de páginas al traer los registros (100 por página). */
const MAX_PAGES = 20;

export function AttendancePanel({ businessId, groupId, onClose }: AttendancePanelProps) {
  const [group, setGroup] = useState<VotingGroup | null>(null);
  const [liveVoting, setLiveVoting] = useState<Voting | null>(null);
  /** Votación del grupo usada para marcar unidades que aún no tienen registro. */
  const [anyVoting, setAnyVoting] = useState<Voting | null>(null);
  const [listId, setListId] = useState<number | null>(null);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AttendanceFilter>('all');
  const [term, setTerm] = useState('');
  const [pending, setPending] = useState<Set<number>>(new Set());
  const [token, setToken] = useState<string | null>(null);
  const [proxyRow, setProxyRow] = useState<AttendanceRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [credentialsMessage, setCredentialsMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const { page, pageSize, setPage } = usePaginationParams();

  /** Trae los registros de la lista y las unidades de la propiedad (con su residente principal). */
  const loadRecords = useCallback(
    async (token: string, id: number | null) => {
      const [unitsRes, residentsRes, firstPage] = await Promise.all([
        // El back acepta hasta 200 por página: se recorren páginas de 200 (fetchAllPages).
        fetchAllPages((p, size) =>
          getPropertyUnitsAction({ businessId, token, page: p, pageSize: size }).then((r) => ({ items: r.units, total: r.total, totalPages: r.totalPages })),
        ).then((units) => ({ units })).catch(() => null),
        fetchAllPages((p, size) =>
          getResidentsAction({ businessId, token, page: p, pageSize: size }).then((r) => ({ items: r.residents, total: r.total, totalPages: r.totalPages })),
        ).then((residents) => ({ residents })).catch(() => null),
        id ? getAttendanceListRecordsAction({ token, id, page: 1, pageSize: 100 }) : Promise.resolve(null),
      ]);
      if (firstPage && !firstPage.success) throw new Error(firstPage.error || 'No se pudieron cargar los registros de asistencia');
      const records = [...((firstPage?.data ?? []) as unknown as AttendanceRecordRaw[])];
      const totalPages = Math.min(firstPage?.total_pages ?? 1, MAX_PAGES);
      for (let page = 2; id && page <= totalPages; page++) {
        const res = await getAttendanceListRecordsAction({ token, id, page, pageSize: 100 });
        if (res.success && res.data) records.push(...(res.data as unknown as AttendanceRecordRaw[]));
      }
      const residentByUnit = new Map<string, string>();
      (residentsRes?.residents ?? [])
        .sort((a, b) => Number(b.isMainResident) - Number(a.isMainResident))
        .forEach((r) => {
          if (r.propertyUnitNumber && !residentByUnit.has(r.propertyUnitNumber)) residentByUnit.set(r.propertyUnitNumber, r.name);
        });
      const units = (unitsRes?.units ?? []).map((u) => ({
        id: u.id,
        number: u.number,
        coefficient: u.coefficient ?? 0,
        residentName: residentByUnit.get(u.number) ?? null,
      }));
      setRows(buildAttendanceRows(records, units));
    },
    [businessId]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const token = TokenStorage.getBusinessToken();
    if (!token) {
      setError('No se encontró el token de autenticación. Vuelve a seleccionar el negocio.');
      setLoading(false);
      return;
    }
    try {
      const [groupsRes, votingsRes, listsRes] = await Promise.all([
        getVotingGroupsAction({ token, businessId }),
        getVotingsAction({ token, businessId, groupId }),
        listAttendanceListsAction({ token, businessId, votingGroupId: groupId }),
      ]);
      setGroup(groupsRes.data?.find((g) => g.id === groupId) ?? null);
      const votings = (votingsRes.data ?? []).sort((a, b) => a.displayOrder - b.displayOrder);
      setLiveVoting(votings.find((v) => v.isActive) ?? null);
      setAnyVoting(votings.find((v) => v.isActive) ?? votings[0] ?? null);

      const lists = ((listsRes.success && listsRes.data) || []) as unknown as { id: number; is_active?: boolean }[];
      const list = [...lists].sort((a, b) => b.id - a.id).find((l) => l.is_active !== false) ?? lists[0];
      setListId(list?.id ?? null);
      await loadRecords(token, list?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la asistencia');
    } finally {
      setLoading(false);
    }
  }, [businessId, groupId, loadRecords]);

  useEffect(() => {
    setToken(TokenStorage.getBusinessToken());
    load();
  }, [load]);

  const generateList = async () => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await generateAttendanceListAction({ token, votingGroupId: groupId });
      if (!res.success) throw new Error(res.error || 'No se pudo generar la lista de asistencia');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo generar la lista de asistencia');
    } finally {
      setGenerating(false);
    }
  };

  const togglePresence = async (row: AttendanceRow, present: boolean) => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    setError(null);
    setPending((p) => new Set(p).add(row.unitId));
    setRows((prev) => setRowPresence(prev, row.unitId, present));
    try {
      if (row.recordId != null) {
        const action = present ? markAttendanceSimpleAction : unmarkAttendanceSimpleAction;
        const res = await action({ token, recordId: row.recordId });
        if (!res.success) throw new Error(res.error || 'No se pudo actualizar la asistencia');
      } else if (anyVoting) {
        // La unidad aún no tiene registro: se marca por la votación del grupo (crea el registro).
        const res = await markUnitAttendanceAction({
          token,
          businessId,
          groupId,
          votingId: anyVoting.id,
          unitId: row.unitId,
          markAttendance: present,
        });
        if (!res.success) throw new Error(res.error || 'No se pudo actualizar la asistencia');
        const lists = await listAttendanceListsAction({ token, businessId, votingGroupId: groupId });
        const raw = ((lists.success && lists.data) || []) as unknown as { id: number; is_active?: boolean }[];
        const list = [...raw].sort((a, b) => b.id - a.id).find((l) => l.is_active !== false) ?? raw[0];
        setListId(list?.id ?? null);
        await loadRecords(token, list?.id ?? null);
      } else {
        throw new Error('Genera la lista de asistencia o crea una votación en el grupo para marcar esta unidad');
      }
    } catch (err) {
      setRows((prev) => setRowPresence(prev, row.unitId, !present));
      setError(`${row.unitNumber}: ${err instanceof Error ? err.message : 'No se pudo actualizar la asistencia'}`);
    } finally {
      setPending((p) => {
        const next = new Set(p);
        next.delete(row.unitId);
        return next;
      });
    }
  };

  /** Refleja en la fila el apoderado guardado o quitado. */
  const applyProxy = (row: AttendanceRow, r: RecordProxyData) => {
    setRows((prev) =>
      prev.map((x) =>
        x.unitId === row.unitId
          ? { ...x, proxyName: r.proxyName, present: r.attendedAsOwner || r.attendedAsProxy, byProxy: r.attendedAsProxy }
          : x,
      ),
    );
    setProxyRow(null);
    setCredentialsMessage({ kind: 'ok', text: r.proxyName ? `Unidad ${row.unitNumber}: apoderado ${r.proxyName}.` : `Unidad ${row.unitNumber}: se quitó el apoderado.` });
  };

  const download = async (kind: AttendanceExportKind) => {
    if (!token || !listId) return;
    setError(null);
    const res = await exportAttendanceAction({ token, listId, kind });
    if (!res.success || res.content === undefined) {
      setError(res.error || 'No se pudo descargar el archivo');
      return;
    }
    const url = URL.createObjectURL(new Blob([res.content], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = res.filename ?? 'asistencia.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const deleteList = async () => {
    if (!token || !listId) return;
    setDeleting(true);
    setDeleteError(null);
    const res = await removeAttendanceListAction({ token, id: listId, businessId });
    setDeleting(false);
    if (!res.success) {
      setDeleteError(res.error || 'No se pudo eliminar la lista');
      return;
    }
    setConfirmDelete(false);
    await load();
  };

  const summary = useMemo(() => summarizeAttendance(rows), [rows]);
  const visible = useMemo(() => filterAttendanceRows(rows, filter, term), [rows, filter, term]);
  const pageRows = useMemo(() => pageSlice(visible, page, pageSize), [visible, page, pageSize]);
  /** Cambiar el filtro o la búsqueda vuelve a la primera página. */
  const changeFilter = (next: AttendanceFilter) => {
    setFilter(next);
    if (page !== 1) setPage(1, { replace: true });
  };
  const changeTerm = (next: string) => {
    setTerm(next);
    if (page !== 1) setPage(1, { replace: true });
  };
  const quorum = group?.requiresQuorum && group.quorumPercentage > 0 ? group.quorumPercentage : DEFAULT_QUORUM_PERCENTAGE;
  const status = getQuorumStatus(summary.presentCoefPct, quorum);

  const tabs: { key: AttendanceFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Todas', count: summary.total },
    { key: 'present', label: 'Presentes', count: summary.present },
    { key: 'absent', label: 'Ausentes', count: summary.absent },
    { key: 'proxy', label: 'Con poder', count: summary.proxy },
  ];

  return (
    <DsPage>
      <DsSectionHeader
        title={
          onClose ? (
            <span>
              Asistencia
              {group?.name && <span className="font-normal text-[#6b6a66]">{` · ${group.name}`}</span>}
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              <Link
                href={`/properties/${businessId}/voting-groups`}
                aria-label="Volver a los grupos de votación"
                title={group?.name ?? 'Grupos de votación'}
                className="inline-flex items-center justify-center w-7 h-7 max-md:w-11 max-md:h-11 rounded-md text-[#6b6a66] hover:text-[#1a1a1a] hover:bg-white"
              >
                <VtIcon name="back" size={14} />
              </Link>
              Asistencia
            </span>
          )
        }
        actions={
          <>
            {token && <VotingCredentialsActions token={token} businessId={businessId} groupId={groupId} onMessage={setCredentialsMessage} canGenerate={permissionsInclude(TokenStorage.getUserPermissions(), VOTING_PASSWORDS_RESOURCE)} />}
            {liveVoting ? (
              <Link href={liveVotingPath(businessId, groupId, liveVoting.id)} className={vtBtn.primary}>
                Ir al panel en vivo
              </Link>
            ) : (
              <button type="button" className={vtBtn.primary} disabled title="No hay una votación abierta en este grupo">
                Ir al panel en vivo
              </button>
            )}
            {listId && (
              <VtMenu
                label="Más opciones de asistencia"
                size={36}
                items={[
                  { label: 'Descargar lista para firmar (Excel)', onSelect: () => download('list') },
                  { label: 'Descargar resumen (Excel)', onSelect: () => download('detailed') },
                  { label: 'Eliminar lista', danger: true, onSelect: () => setConfirmDelete(true) },
                ]}
              />
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar asistencia"
                title="Cerrar (Esc)"
                className="inline-flex items-center justify-center w-9 h-9 max-md:w-11 max-md:h-11 rounded-md text-[#6b6a66] hover:text-[#1a1a1a] hover:bg-white"
              >
                ✕
              </button>
            )}
          </>
        }
      />
      <DsBody>
        {credentialsMessage && (
          <div className="flex items-start justify-between gap-3">
            <VtNotice tone={credentialsMessage.kind === 'ok' ? 'ok' : undefined}>{credentialsMessage.text}</VtNotice>
            <button type="button" onClick={() => setCredentialsMessage(null)} className="text-xs text-[#8a8580] hover:text-[#1a1a1a] mt-2" aria-label="Cerrar aviso">✕</button>
          </div>
        )}
        {error && <VtNotice>{error}</VtNotice>}

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="md" text="Cargando asistencia..." />
          </div>
        ) : !listId && !anyVoting ? (
          <div className="bg-white rounded-[10px] py-14 px-6 text-center" style={{ border: `1px solid ${VT.border}` }}>
            <h2 className="m-0 text-[17px] font-semibold">Este grupo aún no tiene lista de asistencia</h2>
            <p className="mt-1.5 mb-5 text-[13px]" style={{ color: VT.muted }}>
              Se genera con todas las unidades y sus residentes; luego marcas quién está presente.
            </p>
            <button type="button" className={vtBtn.primary} onClick={generateList} disabled={generating}>
              {generating ? 'Generando…' : 'Generar lista de asistencia'}
            </button>
          </div>
        ) : (
          <>
            {/* Resumen por coeficiente */}
            <div
              className="bg-white rounded-[10px] px-4 sm:px-[22px] py-[18px] grid grid-cols-1 md:grid-cols-[1fr_auto] gap-5 md:gap-10 items-center"
              style={{ border: `1px solid ${VT.border}` }}
            >
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-[13px]" style={{ color: VT.inkSoft }}>Presentes por coeficiente</span>
                  <span className={`${vtMono} text-[22px] leading-none font-semibold tracking-[-.03em]`}>
                    {formatPct(summary.presentCoefPct)}
                    <span className="text-xs" style={{ color: VT.muted }}>%</span>
                  </span>
                </div>
                <div className="relative h-3.5" role="img" aria-label={`Presentes ${formatPct(summary.presentCoefPct)}% del coeficiente. Quórum ${quorum}%`}>
                  <div className="h-full rounded bg-white overflow-hidden" style={{ border: `1px solid ${VT.borderStrong}` }}>
                    <div className="h-full transition-[width] duration-500" style={{ width: `${Math.min(summary.presentCoefPct, 100)}%`, background: VT.ink }} />
                  </div>
                  <div className="absolute w-0.5" style={{ top: -5, bottom: -5, left: `${quorum}%`, background: VT.accent }} />
                </div>
                <div className={`${vtMono} flex justify-between text-[10px] mt-1.5`} style={{ color: VT.muted }}>
                  <span>{summary.present} de {summary.total} unidades</span>
                  <span style={{ color: VT.accent }}>quórum {quorum}%</span>
                </div>
              </div>
              <div
                className="inline-flex justify-self-start md:justify-self-auto items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-semibold"
                style={{ background: status.bg, color: status.fg }}
                role="status"
              >
                {status.label}
              </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-[10px] flex flex-col overflow-hidden" style={{ border: `1px solid ${VT.border}` }}>
              <div className="px-4 sm:px-[18px] py-3 flex flex-wrap justify-between items-center gap-3" style={{ borderBottom: `1px solid ${VT.border}` }}>
                <div className="flex flex-wrap gap-1" role="tablist" aria-label="Filtrar unidades">
                  {tabs.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      role="tab"
                      aria-selected={filter === t.key}
                      onClick={() => changeFilter(t.key)}
                      className="px-2.5 py-1 max-md:h-9 max-md:px-3 rounded-[5px] text-xs font-medium"
                      style={filter === t.key ? { background: VT.ink, color: '#fff' } : { color: VT.inkSoft }}
                    >
                      {t.label} · {t.count}
                    </button>
                  ))}
                </div>
                <label
                  className="flex items-center gap-2 h-[30px] max-md:h-11 max-md:text-base px-2.5 rounded-md text-xs w-full sm:w-[240px] focus-within:ring-1 focus-within:ring-[#c8603f]"
                  style={{ border: `1px solid ${VT.borderStrong}`, color: VT.muted }}
                >
                  <VtIcon name="search" size={14} />
                  <input
                    type="search"
                    value={term}
                    onChange={(e) => changeTerm(e.target.value)}
                    placeholder="Unidad, residente o apoderado"
                    aria-label="Buscar unidad, residente o apoderado"
                    className="flex-1 min-w-0 bg-transparent outline-none"
                    style={{ color: VT.ink }}
                  />
                </label>
              </div>

              {/* Teléfono: una fila táctil por unidad (tocar la fila marca o quita la presencia) */}
              <ul className="md:hidden m-0 p-0 list-none" aria-label="Unidades">
                {pageRows.map((row) => {
                  const busy = pending.has(row.unitId);
                  return (
                    <li
                      key={row.unitId}
                      className="flex items-center gap-3 px-3 py-2.5 min-h-[56px] cursor-pointer active:bg-[#faf9f7]"
                      style={{ borderTop: `1px solid #efedea` }}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('[role="switch"], button') || busy) return;
                        togglePresence(row, !row.present);
                      }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 min-w-0">
                          <span className={`${vtMono} text-sm font-semibold shrink-0`}>{row.unitNumber}</span>
                          <span className={`${vtMono} text-[11px] shrink-0`} style={{ color: VT.muted }}>{formatCoef(row.coefPct)}%</span>
                        </div>
                        <div className="text-[13px] truncate" title={row.residentName}>{row.residentName}</div>
                        <div className="mt-0.5">
                          <ProxyButton row={row} onEdit={setProxyRow} />
                        </div>
                      </div>
                      <VtSwitch
                        checked={row.present}
                        onChange={(next) => togglePresence(row, next)}
                        label={`Presente ${row.unitNumber}`}
                        disabled={busy}
                        busy={busy}
                      />
                    </li>
                  );
                })}
              </ul>

              <div className="overflow-x-auto max-md:hidden">
                <table className="w-full min-w-[620px] text-[13px] border-collapse">
                  <thead>
                    <tr className={`${vtMono} text-[10px] font-medium tracking-[.06em] text-left`} style={{ color: VT.muted }}>
                      <th scope="col" className="px-4 sm:px-[18px] py-2 font-medium w-[110px]">UNIDAD</th>
                      <th scope="col" className="px-2 py-2 font-medium">RESIDENTE</th>
                      <th scope="col" className="px-2 py-2 font-medium w-[180px]">PODER</th>
                      <th scope="col" className="px-2 py-2 font-medium w-[100px]">COEF.</th>
                      <th scope="col" className="px-4 sm:px-[18px] py-2 font-medium w-[110px] text-right">PRESENTE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((row) => (
                      <tr key={row.unitId} style={{ borderTop: `1px solid #efedea` }}>
                        <td className={`${vtMono} px-4 sm:px-[18px] py-2 font-medium`}>{row.unitNumber}</td>
                        <td className="px-2 py-2">{row.residentName}</td>
                        <td className="px-2 py-2 text-xs">
                          <ProxyButton row={row} onEdit={setProxyRow} />
                        </td>
                        <td className={`${vtMono} px-2 py-2 text-xs`} style={{ color: VT.muted }}>
                          {formatCoef(row.coefPct)}%
                        </td>
                        <td className="px-4 sm:px-[18px] py-2">
                          <div className="flex justify-end">
                            <VtSwitch
                              checked={row.present}
                              onChange={(next) => togglePresence(row, next)}
                              label={`Presente ${row.unitNumber}`}
                              disabled={pending.has(row.unitId)}
                              busy={pending.has(row.unitId)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                {visible.length === 0 && (
                  <p className="text-center text-[13px] py-10 m-0" style={{ color: VT.muted }}>
                    {rows.length === 0 ? 'La lista no tiene unidades.' : 'No hay unidades con ese criterio.'}
                  </p>
                )}
              {visible.length > 0 && (
                <div className="px-4 sm:px-[18px] py-2.5" style={{ borderTop: `1px solid ${VT.border}` }}>
                  <Pagination total={visible.length} disabled={loading} />
                </div>
              )}
            </div>
          </>
        )}
      </DsBody>

      <AttendanceProxyDialog row={proxyRow} token={token} onClose={() => setProxyRow(null)} onSaved={applyProxy} />
      <DsConfirmDialog
        open={confirmDelete}
        title="Eliminar lista de asistencia"
        message="Se borran los registros de asistencia y los apoderados de esta asamblea. Las votaciones no se borran. Esta acción no se puede deshacer."
        confirmLabel="Eliminar lista"
        busy={deleting}
        error={deleteError}
        onConfirm={deleteList}
        onClose={() => setConfirmDelete(false)}
      />
    </DsPage>
  );
}

/** Celda de poder: el nombre del apoderado (para editarlo) o "+ Apoderado". */
function ProxyButton({ row, onEdit }: { row: AttendanceRow; onEdit: (row: AttendanceRow) => void }) {
  const disabled = row.recordId == null;
  return (
    <button
      type="button"
      onClick={() => onEdit(row)}
      disabled={disabled}
      title={disabled ? 'Genera la lista de asistencia para asignar apoderados' : row.proxyName ? 'Editar o quitar el apoderado' : 'Agregar apoderado'}
      aria-label={row.proxyName ? `Apoderado de ${row.unitNumber}: ${row.proxyName}. Editar` : `Agregar apoderado a ${row.unitNumber}`}
      className={`max-w-full truncate text-left rounded px-1.5 py-1 -mx-1.5 max-md:min-h-9 text-xs disabled:opacity-40 disabled:cursor-not-allowed ${
        row.proxyName ? 'text-[#4b4a46] hover:bg-[#f5f5f4] hover:underline' : 'text-[#c8603f] font-medium hover:bg-[#fbe9e4]'
      }`}
    >
      {row.proxyName || '+ Apoderado'}
    </button>
  );
}
