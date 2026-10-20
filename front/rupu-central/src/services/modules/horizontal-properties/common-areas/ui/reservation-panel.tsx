/**
 * Z4 · Detalle de reserva en panel lateral (460 px): "RESERVA #318 · SOLICITADA AYER 21:10",
 * estado, zona, fecha y personas; unidad ("Casa 126") con reservas previas, motivo, pagos
 * (tarifa, depósito, total, con marcas de pagado), disponibilidad (cruces) y mensaje al
 * residente. Acciones: Aprobar / Rechazar si está pendiente; si no, confirmar, ingreso,
 * salida o cancelar según el estado.
 */

'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { DS, DsEyebrow, VtIcon, VtNotice, dsFontRoot, dsMono, vtBtn, vtTextarea } from '@/shared/ui/ds';
import type { CommonAreaReservation, ReservationListDTO, UpdatePaymentsDTO } from '../domain';
import {
  approveReservationAction,
  cancelReservationAction,
  checkInReservationAction,
  checkOutReservationAction,
  confirmReservationAction,
  getReservationByIdAction,
  getReservationsAction,
  rejectReservationAction,
  updateReservationPaymentsAction,
} from '../infrastructure/actions';
import type { ActionResult } from '../infrastructure/actions';
import {
  ACTION_LABEL,
  addDays,
  availableActions,
  calendarTone,
  findConflicts,
  formatDateTime,
  formatThousands,
  nextReservation,
  relativeDay,
  relativeMoment,
  reservationDay,
  reservationTimeline,
  statusMeta,
  unitLabel,
  type ReservationAction,
} from './design';

export interface ReservationPanelProps {
  businessId: number;
  reservationId: number | null;
  getToken: () => Promise<string>;
  onClose: () => void;
  /** Se llama después de cada cambio para refrescar calendario y listas. */
  onChanged: (message: string) => void;
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="py-3.5 border-b border-[#efedea] last:border-b-0">
      <DsEyebrow className="mb-2">{label}</DsEyebrow>
      {children}
    </section>
  );
}

function PayLine({ label, amount, paid, onToggle, busy, toggleLabel }: { label: string; amount: number; paid?: boolean; onToggle?: () => void; busy?: boolean; toggleLabel?: string }) {
  return (
    <div className="flex items-center gap-2 py-1 text-[13px]">
      <span className="flex-1 min-w-0 text-[#4b4a46]">{label}</span>
      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          aria-label={toggleLabel}
          className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${paid ? 'border-[#1f8a4c] text-[#1f8a4c] bg-[#e3f1e8]' : 'border-[#d6d3cd] text-[#8a8580] bg-white hover:border-[#1a1a1a]'}`}
        >
          {paid ? 'pagado ✓' : 'marcar pagado'}
        </button>
      )}
      <span className={`${dsMono} w-[84px] text-right`}>{formatThousands(amount)}</span>
    </div>
  );
}

export function ReservationPanel({ businessId, reservationId, getToken, onClose, onChanged }: ReservationPanelProps) {
  const [reservation, setReservation] = useState<CommonAreaReservation | null>(null);
  const [sameDay, setSameDay] = useState<ReservationListDTO[] | null>(null);
  const [previous, setPrevious] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (reservationId === null) return;
    let cancelled = false;
    setReservation(null);
    setSameDay(null);
    setPrevious(null);
    setError(null);
    setMessage('');
    setCancelling(false);
    setLoading(true);
    (async () => {
      try {
        const token = await getToken();
        const result = await getReservationByIdAction({ token, businessId, id: reservationId });
        if (cancelled) return;
        if (!result.success) {
          setError(result.error);
          return;
        }
        const r = result.data;
        setReservation(r);
        const day = reservationDay(r.reservationDate);
        const [dayRes, prevRes] = await Promise.all([
          getReservationsAction({ token, businessId, commonAreaId: r.commonAreaId, startDate: day, endDate: day, page: 1, pageSize: 100 }),
          getReservationsAction({ token, businessId, propertyUnitId: r.propertyUnitId, endDate: addDays(day, -1), page: 1, pageSize: 1 }),
        ]);
        if (cancelled) return;
        setSameDay(dayRes.success ? dayRes.data.data : null);
        setPrevious(prevRes.success ? prevRes.data.total : null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'No se pudo cargar la reserva');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reservationId, businessId, getToken]);

  useEffect(() => {
    if (reservationId === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [reservationId, busy, onClose]);

  const run = useCallback(
    async (call: (token: string) => Promise<ActionResult<CommonAreaReservation>>, done: string) => {
      setBusy(true);
      setError(null);
      try {
        const token = await getToken();
        const result = await call(token);
        if (!result.success) {
          setError(result.error);
          return;
        }
        setReservation(result.data);
        setMessage('');
        setCancelling(false);
        onChanged(done);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo completar la acción');
      } finally {
        setBusy(false);
      }
    },
    [getToken, onChanged],
  );

  if (reservationId === null) return null;

  const r = reservation;
  const id = reservationId;
  const unit = r ? unitLabel(r.propertyUnitNumber, r.propertyUnitBlock) : '';
  const actions = availableActions(r?.statusCode);
  const pending = r?.statusCode === 'pending';
  const meta = statusMeta(r?.statusCode, r?.statusName);
  const pill = pending ? { label: 'Pendiente de aprobar', bg: '#fbe9e4', fg: DS.accent } : { label: meta.label, bg: meta.bg, fg: meta.fg };
  const total = r?.totalAmount ?? 0;
  const deposit = r?.depositAmount ?? 0;
  const rate = r && total && r.durationHours ? total / r.durationHours : 0;
  const tone = r ? calendarTone(r) : 'past';
  const showAvailability = r && sameDay && tone !== 'past' && !['rejected', 'cancelled', 'expired'].includes(r.statusCode ?? '');
  const conflicts = r && sameDay ? findConflicts(r, sameDay) : [];
  const next = r && sameDay ? nextReservation(r, sameDay) : undefined;

  const doAction = (action: ReservationAction) => {
    if (action === 'cancel') {
      setCancelling(true);
      return;
    }
    if (action === 'reject') {
      if (!message.trim()) {
        setError('Escribe en «Mensaje al residente» el motivo del rechazo.');
        return;
      }
      run((t) => rejectReservationAction({ token: t, businessId, id, reason: message.trim() }), `Reserva de ${unit} rechazada`);
      return;
    }
    const map = {
      approve: [(t: string) => approveReservationAction({ token: t, businessId, id }), `Reserva de ${unit} aprobada`],
      confirm: [(t: string) => confirmReservationAction({ token: t, businessId, id }), `Reserva de ${unit} confirmada`],
      checkIn: [(t: string) => checkInReservationAction({ token: t, businessId, id }), `Ingreso de ${unit} registrado`],
      checkOut: [(t: string) => checkOutReservationAction({ token: t, businessId, id }), `Salida de ${unit} registrada`],
    } as const;
    const [call, done] = map[action];
    run(call, done);
  };

  const pay = (data: UpdatePaymentsDTO, done: string) => run((t) => updateReservationPaymentsAction({ token: t, businessId, id, data }), done);

  return (
    <>
      <div className="fixed inset-0 z-[54] bg-black/30 md:hidden" onClick={() => !busy && onClose()} aria-hidden="true" />
      <aside
        role="dialog"
        aria-modal="false"
        aria-label={r ? `Reserva de ${unit} en ${r.commonAreaName ?? 'la zona'}` : 'Detalle de reserva'}
        className={`${dsFontRoot} fixed inset-y-0 right-0 z-[55] w-full md:w-[460px] bg-white border-l border-[#e4e2dd] shadow-[-8px_0_32px_rgba(0,0,0,.10)] flex flex-col text-[#1a1a1a]`}
      >
        <header className="px-6 pt-5 pb-4 border-b border-[#efedea]">
          <div className="flex items-center justify-between gap-3">
            <span className={`${dsMono} text-[11px] tracking-[.06em] uppercase text-[#8a8580]`}>
              Reserva #{id}
              {r?.createdAt ? ` · solicitada ${relativeMoment(r.createdAt)}` : ''}
            </span>
            <button type="button" onClick={onClose} disabled={busy} aria-label="Cerrar detalle" className="text-[#8a8580] hover:text-[#1a1a1a] max-md:w-11 max-md:h-11 flex items-center justify-center">
              <VtIcon name="close" size={20} />
            </button>
          </div>
          {r ? (
            <>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className={`${dsMono} px-2 py-[3px] rounded-full text-[10px] font-semibold tracking-[.06em] uppercase`} style={{ background: pill.bg, color: pill.fg }}>
                  {pill.label}
                </span>
                {deposit > 0 && !r.depositPaid && <span className="text-xs text-[#8a8580]">requiere depósito</span>}
              </div>
              <h2 className="m-0 mt-2 text-xl font-semibold tracking-[-.015em]">{r.commonAreaName ?? 'Zona común'}</h2>
              <div className="flex items-center gap-3 mt-1 text-[13px] text-[#4b4a46]">
                <span className={dsMono}>
                  {relativeDay(reservationDay(r.reservationDate))} · {r.startTime} – {r.endTime}
                </span>
                <span>
                  {r.numberOfGuests} {r.numberOfGuests === 1 ? 'invitado' : 'invitados'}
                </span>
              </div>
            </>
          ) : (
            <h2 className="m-0 mt-2 text-xl font-semibold">Cargando…</h2>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-6">
          {error && (
            <div className="pt-3.5">
              <VtNotice>{error}</VtNotice>
            </div>
          )}
          {loading && !r && <div className="py-10 text-center text-sm text-[#8a8580]">Cargando…</div>}
          {r && (
            <>
              <div className="mt-4 rounded-2xl bg-[#f5f5f4] px-4 py-3">
                <div className={`${dsMono} text-base font-semibold`}>{unit}</div>
                {r.residentName && <div className="text-[13px]">{r.residentName}</div>}
                {previous !== null && (
                  <div className="text-xs text-[#8a8580] mt-0.5">{previous === 0 ? 'primera reserva' : previous === 1 ? '1 reserva previa' : `${previous} reservas previas`}</div>
                )}
              </div>

              {(r.purpose || r.specialRequests) && (
                <Section label="Motivo">
                  {r.purpose && <div className="text-sm">{r.purpose}</div>}
                  {r.specialRequests && <div className="text-xs text-[#8a8580] mt-1">Solicitud: {r.specialRequests}</div>}
                </Section>
              )}

              <Section label="Pagos">
                {!total && !deposit ? (
                  <div className="text-[13px] text-[#8a8580]">Sin costo</div>
                ) : (
                  <>
                    {total > 0 && (
                      <PayLine
                        label={rate ? `Tarifa · ${r.durationHours} h × ${formatThousands(rate)}` : 'Tarifa'}
                        amount={total}
                        paid={r.fullPaymentPaid}
                        busy={busy}
                        toggleLabel={r.fullPaymentPaid ? 'Desmarcar pago de la tarifa' : 'Marcar tarifa como pagada'}
                        onToggle={() => pay({ fullPaymentPaid: !r.fullPaymentPaid }, r.fullPaymentPaid ? 'Pago desmarcado' : 'Pago registrado')}
                      />
                    )}
                    {deposit > 0 && (
                      <PayLine
                        label="Depósito reembolsable"
                        amount={deposit}
                        paid={r.depositPaid}
                        busy={busy}
                        toggleLabel={r.depositPaid ? 'Desmarcar depósito' : 'Marcar depósito como pagado'}
                        onToggle={() => pay({ depositPaid: !r.depositPaid }, r.depositPaid ? 'Depósito desmarcado' : 'Depósito registrado')}
                      />
                    )}
                    <div className="flex items-center pt-2 mt-1 border-t border-[#efedea] text-[13px] font-semibold">
                      <span className="flex-1">Total</span>
                      <span className={`${dsMono} w-[84px] text-right`}>{formatThousands(total + deposit)}</span>
                    </div>
                  </>
                )}
              </Section>

              {showAvailability && (
                <Section label="Disponibilidad">
                  {conflicts.length === 0 ? (
                    <div className="text-[13px] text-[#1f8a4c]">
                      ✓ Sin cruces{next ? ` · siguiente reserva ${next.startTime}` : ''}
                    </div>
                  ) : (
                    <ul className="list-none m-0 p-0 text-[13px] text-[#c8603f]">
                      {conflicts.map((c) => (
                        <li key={c.id}>
                          ✕ Se cruza con {unitLabel(c.propertyUnitNumber, c.propertyUnitBlock)} · {c.startTime}–{c.endTime} ({statusMeta(c.statusCode, c.statusName).label.toLowerCase()})
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
              )}

              {(pending || cancelling) && (
                <Section label={cancelling ? 'Motivo de la cancelación' : 'Mensaje al residente'}>
                  <textarea
                    aria-label={cancelling ? 'Motivo de la cancelación' : 'Mensaje al residente'}
                    rows={2}
                    className={vtTextarea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={500}
                    placeholder={cancelling ? 'Opcional' : 'Opcional · obligatorio si rechazas'}
                  />
                </Section>
              )}

              <Section label="Línea de tiempo">
                <ol className="list-none m-0 p-0 relative">
                  {reservationTimeline(r).map((ev, i, all) => (
                    <li key={`${ev.label}-${i}`} className="relative pl-5 pb-3 last:pb-0">
                      {i < all.length - 1 && <span className="absolute left-[4px] top-3 bottom-0 w-px bg-[#e4e2dd]" aria-hidden="true" />}
                      <span
                        className="absolute left-0 top-1 w-[9px] h-[9px] rounded-full"
                        style={{ background: ev.tone === 'ok' ? DS.yes : ev.tone === 'danger' ? DS.no : DS.muted }}
                        aria-hidden="true"
                      />
                      <div className="text-[13px] font-medium">{ev.label}</div>
                      {ev.at && <div className={`${dsMono} text-[11px] text-[#8a8580]`}>{formatDateTime(ev.at)}</div>}
                      {ev.detail && <div className="text-xs text-[#4b4a46]">{ev.detail}</div>}
                    </li>
                  ))}
                </ol>
              </Section>

              {r.accessCode && (
                <Section label="Acceso">
                  <span className={`${dsMono} px-2.5 py-1 border-[1.5px] border-[#1a1a1a] rounded-xl text-base font-semibold tracking-[.12em]`}>{r.accessCode}</span>
                  <span className="ml-2 text-xs text-[#8a8580]">código para portería</span>
                </Section>
              )}
            </>
          )}
        </div>

        {r && (actions.length > 0 || cancelling) && (
          <footer className="px-6 py-4 border-t border-[#efedea] flex gap-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {cancelling ? (
              <>
                <button type="button" className={`${vtBtn.secondary} !h-11`} onClick={() => setCancelling(false)} disabled={busy}>
                  Volver
                </button>
                <button
                  type="button"
                  className={`${vtBtn.primary} !h-11 flex-1 !bg-[#c8382d]`}
                  disabled={busy}
                  onClick={() => run((t) => cancelReservationAction({ token: t, businessId, id, reason: message.trim() || undefined }), `Reserva de ${unit} cancelada`)}
                >
                  Confirmar cancelación
                </button>
              </>
            ) : pending ? (
              <>
                <button type="button" className={`${vtBtn.primary} !h-11 flex-1`} onClick={() => doAction('approve')} disabled={busy}>
                  {ACTION_LABEL.approve}
                </button>
                <button type="button" className="h-11 px-4 rounded-xl text-[13px] font-semibold bg-white text-[#c8382d] border border-[#c8382d] hover:bg-[#fbe9e4] disabled:opacity-50" onClick={() => doAction('reject')} disabled={busy}>
                  {ACTION_LABEL.reject}
                </button>
              </>
            ) : (
              <>
                {actions.includes('cancel') && (
                  <button type="button" className={`${vtBtn.ghost} !h-11`} onClick={() => doAction('cancel')} disabled={busy}>
                    {ACTION_LABEL.cancel}
                  </button>
                )}
                {actions
                  .filter((a) => a !== 'cancel' && a !== 'reject')
                  .map((a) => (
                    <button key={a} type="button" className={`${vtBtn.primary} !h-11 flex-1`} onClick={() => doAction(a)} disabled={busy}>
                      {ACTION_LABEL[a]}
                    </button>
                  ))}
              </>
            )}
          </footer>
        )}
      </aside>
    </>
  );
}
