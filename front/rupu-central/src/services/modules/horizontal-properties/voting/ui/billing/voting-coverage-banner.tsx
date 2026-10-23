/**
 * Aviso de cobro de la propiedad: membresía o días comprados, fechas de las asambleas próximas que
 * faltan por cubrir y los botones para comprar días o el mes. Al volver de Wompi
 * (?pago=dias|membresia&id=<transacción>) confirma el pago. El super admin además exenta la
 * propiedad o a sus administradores y otorga días o un mes (manual o cortesía).
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { TokenStorage } from '@shared/config';
import {
  createDaysCheckoutAction,
  createMembershipCheckoutAction,
  getVotingCoverageAction,
  grantDaysAction,
  grantMembershipAction,
  listMembershipPlansAction,
  setPropertyExemptionAction,
  syncDaysAction,
  syncMembershipAction,
} from '../../infrastructure/actions';
import { coverageView, datesToCover, formatCop, formatVotingDate, type VotingCoverage } from '../../domain/entities';
import { VT, VtNotice, vtBtn } from '../design';
import { DaysDialog, type DaysDialogMode } from './days-dialog';
import { PropertyAdminsDialog } from './property-admins-dialog';
import { useIsSuperAdmin } from './use-is-super-admin';

export const PAYMENT_PARAM = 'pago';
const MONTH_PLAN = 'MONTH_1';

const list = (dates: string[]) => dates.map(formatVotingDate).join(', ');
const endDate = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', timeZone: 'America/Bogota' });

export function VotingCoverageBanner({ businessId }: { businessId: number }) {
  const isSuperAdmin = useIsSuperAdmin();
  const [coverage, setCoverage] = useState<VotingCoverage | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DaysDialogMode | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [adminsOpen, setAdminsOpen] = useState(false);
  const [monthPrice, setMonthPrice] = useState<number | null>(null);

  const token = () => TokenStorage.getBusinessToken();

  const load = useCallback(async () => {
    const t = TokenStorage.getBusinessToken();
    if (!t) return;
    const [r, plans] = await Promise.all([getVotingCoverageAction({ token: t, businessId }), listMembershipPlansAction({ token: t })]);
    if (r.success && r.data) setCoverage(r.data);
    else setError(r.error ?? 'No se pudo consultar el cobro');
    const month = plans.data?.find((p) => p.code === MONTH_PLAN);
    if (month) setMonthPrice(month.priceCop);
  }, [businessId]);

  // Al volver de Wompi: confirmar la transacción y limpiar la URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const kind = params.get(PAYMENT_PARAM);
    const transactionId = params.get('id');
    const t = TokenStorage.getBusinessToken();
    if (!kind || !transactionId || !t) {
      load();
      return;
    }
    setBusy(true);
    const done = (ok: boolean, msg: string) => {
      setBusy(false);
      window.history.replaceState(null, '', window.location.pathname);
      if (ok) setNotice(msg);
      else setError(msg);
      load();
    };
    if (kind === 'membresia') {
      syncMembershipAction({ token: t, transactionId }).then((r) =>
        done(r.success, r.success ? (r.data?.status === 'ACTIVE' ? '¡Membresía activa! Votaciones ilimitadas por 30 días.' : 'Wompi todavía no confirma el pago. Recarga en unos minutos.') : r.error ?? 'No se pudo confirmar el pago'));
    } else {
      syncDaysAction({ token: t, businessId, transactionId }).then((r) =>
        done(r.success, r.success ? '¡Pago recibido! Tus días de votación quedaron listos.' : r.error ?? 'No se pudo confirmar el pago'));
    }
  }, [businessId, load]);

  const returnUrl = (kind: 'dias' | 'membresia') => `${window.location.origin}${window.location.pathname}?${PAYMENT_PARAM}=${kind}`;

  const submitDays = async (dates: string[], grant?: { source: 'manual' | 'cortesia'; notes: string }) => {
    const t = token();
    if (!t) return;
    setBusy(true);
    setDialogError(null);
    if (grant) {
      const r = await grantDaysAction({ token: t, businessId, dates, ...grant });
      setBusy(false);
      if (!r.success) return setDialogError(r.error ?? 'No se pudieron otorgar los días');
      setDialog(null);
      setNotice('Días otorgados.');
      return load();
    }
    const r = await createDaysCheckoutAction({ token: t, businessId, dates, redirectUrl: returnUrl('dias') });
    if (r.success && r.data) return window.location.assign(r.data.checkoutUrl);
    setBusy(false);
    setDialogError(r.error ?? 'No se pudo iniciar el pago');
  };

  const buyMonth = async () => {
    const t = token();
    if (!t) return;
    setBusy(true);
    setError(null);
    const r = await createMembershipCheckoutAction({ token: t, planCode: MONTH_PLAN, businessIds: [businessId], redirectUrl: returnUrl('membresia') });
    if (r.success && r.data) return window.location.assign(r.data.checkoutUrl);
    setBusy(false);
    setError(r.error ?? 'No se pudo iniciar el pago');
  };

  const grantMonth = async () => {
    const t = token();
    if (!t) return;
    setBusy(true);
    const r = await grantMembershipAction({ token: t, planCode: MONTH_PLAN, businessIds: [businessId], source: 'cortesia', notes: 'Cortesía desde el panel' });
    setBusy(false);
    if (!r.success) return setError(r.error ?? 'No se pudo otorgar el mes');
    setNotice('Mes de cortesía activo.');
    load();
  };

  const toggleExemption = async () => {
    const t = token();
    if (!t || !coverage) return;
    setBusy(true);
    const r = await setPropertyExemptionAction({ token: t, businessId, exempt: !coverage.propertyExempt });
    setBusy(false);
    if (!r.success) return setError(r.error ?? 'No se pudo cambiar la exención');
    load();
  };

  if (!coverage) return error ? <VtNotice>{error}</VtNotice> : null;
  const view = coverageView(coverage);
  const canPay = coverage.gatewayEnabled;

  const buyButtons = (
    <div className="flex gap-2 flex-wrap">
      {canPay && (
        <button type="button" className={vtBtn.primary} onClick={() => { setDialogError(null); setDialog('buy'); }} disabled={busy}>
          Comprar días
        </button>
      )}
      {canPay && monthPrice !== null && (
        <button type="button" className={vtBtn.secondary} onClick={buyMonth} disabled={busy}>
          Mes ilimitado {formatCop(monthPrice)}
        </button>
      )}
      <Link href={`/properties/${businessId}/voting-groups/plans`} className={vtBtn.ghost}>Planes para administradoras</Link>
    </div>
  );

  return (
    <section aria-label="Cobro de votaciones" className="flex flex-col gap-2">
      {notice && <VtNotice tone="ok">{notice}</VtNotice>}
      {error && <VtNotice>{error}</VtNotice>}

      {view.kind === 'due' && (
        <div className="flex flex-col md:flex-row md:items-center gap-3 rounded-lg px-3.5 py-3" style={{ background: VT.missingBg, border: '1px solid #f1cfc4', color: '#9c3a22' }}>
          <div className="flex-1 text-[13px] leading-snug">
            <strong>Tus asambleas necesitan {view.missing.length} {view.missing.length === 1 ? 'día' : 'días'} de votación · {formatCop(view.total)}</strong>
            <div>Sin cubrir: {list(view.missing)}. Puedes preparar todo; los votos entran solo en días cubiertos.</div>
            {!canPay && <div>El pago en línea todavía no está disponible.</div>}
          </div>
          {buyButtons}
        </div>
      )}

      {view.kind === 'ok' && (
        <div className="flex flex-col md:flex-row md:items-center gap-3 rounded-lg px-3.5 py-3" style={{ background: VT.paper, border: `1px solid ${VT.border}` }}>
          <div className="flex-1 text-[13px]" style={{ color: VT.inkSoft }}>
            {view.todayCovered ? '✓ Hoy tienes día de votación.' : 'Compra el día de tu asamblea o un mes ilimitado antes de votar.'}
            {coverage.purchasedDates.length > 0 && <> Días comprados: {list(coverage.purchasedDates)}.</>}
          </div>
          {buyButtons}
        </div>
      )}

      {view.kind === 'membership' && (
        <div className="text-[13px] rounded-lg px-3.5 py-2.5" style={{ background: VT.reachedBg, color: VT.reachedFg }}>
          ✓ Membresía activa hasta el {endDate(view.endsAt)}: votaciones ilimitadas.
          {view.missing.length > 0 && <span style={{ color: '#9c3a22' }}> Fechas después de que vence: {list(view.missing)}.</span>}
        </div>
      )}

      {view.kind === 'exempt' && isSuperAdmin && (
        <div className="text-[12px]" style={{ color: VT.muted }}>
          Sin cobro: {view.by === 'property' ? 'la propiedad está exenta' : 'su administrador está exento'}.
        </div>
      )}

      {isSuperAdmin && (
        <div className="flex flex-wrap items-center gap-3 text-[12px]" style={{ color: VT.muted }}>
          <span>Super admin:</span>
          <button type="button" className="underline" onClick={toggleExemption} disabled={busy}>
            {coverage.propertyExempt ? 'Cobrarle a la propiedad' : 'Exentar la propiedad'}
          </button>
          <button type="button" className="underline" onClick={() => setAdminsOpen(true)}>Administradores</button>
          <button type="button" className="underline" onClick={() => { setDialogError(null); setDialog('grant'); }}>Otorgar días</button>
          <button type="button" className="underline" onClick={grantMonth} disabled={busy}>Mes de cortesía</button>
        </div>
      )}

      <DaysDialog
        open={dialog !== null}
        mode={dialog ?? 'buy'}
        initialDates={datesToCover(coverage)}
        today={coverage.today}
        pricePerDayCop={coverage.pricePerDayCop}
        busy={busy}
        error={dialogError}
        onClose={() => setDialog(null)}
        onSubmit={submitDays}
      />
      {isSuperAdmin && <PropertyAdminsDialog open={adminsOpen} businessId={businessId} onClose={() => setAdminsOpen(false)} onChanged={load} />}
    </section>
  );
}
