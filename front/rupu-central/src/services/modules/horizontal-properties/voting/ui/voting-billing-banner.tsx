/**
 * Aviso de cobro del grupo de votación: cuánto se debe por los días de votación y el botón para
 * pagar con Wompi. Al volver de Wompi (?payment_group=<id>&id=<transacción>) confirma el pago.
 * El super admin además puede registrar un pago manual y exentar la propiedad.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { usePermissions } from '@/services/auth/permissions/ui/hooks/use-permissions';
import {
  createVotingCheckoutAction,
  getVotingBillingStatusAction,
  registerManualVotingPaymentAction,
  setVotingBillingExemptionAction,
  syncVotingPaymentAction,
} from '../infrastructure/actions';
import { votingBillingView, type VotingBillingStatus } from '../domain/entities';
import { VT, VtNotice, vtBtn } from './design';

export const PAYMENT_GROUP_PARAM = 'payment_group';

interface VotingBillingBannerProps {
  businessId: number;
  groupId: number;
}

const plural = (n: number) => `${n} ${n === 1 ? 'día' : 'días'} de votación`;

export function VotingBillingBanner({ businessId, groupId }: VotingBillingBannerProps) {
  const { permissions } = usePermissions();
  const isSuperAdmin = (permissions ?? TokenStorage.getUserPermissions())?.isSuperAdmin ?? false;
  const [status, setStatus] = useState<VotingBillingStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    const result = await getVotingBillingStatusAction({ token, businessId, groupId });
    if (result.success && result.data) setStatus(result.data);
    else setError(result.error ?? 'No se pudo consultar el pago');
  }, [businessId, groupId]);

  // Al volver de Wompi: confirmar la transacción con el back y limpiar la URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get('id');
    if (params.get(PAYMENT_GROUP_PARAM) !== String(groupId) || !transactionId) {
      load();
      return;
    }
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    setBusy(true);
    syncVotingPaymentAction({ token, businessId, groupId, transactionId }).then((result) => {
      setBusy(false);
      window.history.replaceState(null, '', window.location.pathname);
      if (result.success && result.data) {
        setStatus(result.data);
        setNotice(result.data.paid ? '¡Pago recibido! Ya puedes abrir las votaciones.' : 'Wompi todavía no confirma el pago. Si ya pagaste, recarga en unos minutos.');
      } else {
        setError(result.error ?? 'No se pudo confirmar el pago');
        load();
      }
    });
  }, [businessId, groupId, load]);

  const pay = async () => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    setBusy(true);
    setError(null);
    const redirectUrl = `${window.location.origin}${window.location.pathname}?${PAYMENT_GROUP_PARAM}=${groupId}`;
    const result = await createVotingCheckoutAction({ token, businessId, groupId, redirectUrl });
    if (result.success && result.data) {
      window.location.assign(result.data.checkoutUrl);
      return;
    }
    setBusy(false);
    setError(result.error ?? 'No se pudo iniciar el pago');
  };

  const registerManual = async () => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    setBusy(true);
    setError(null);
    const result = await registerManualVotingPaymentAction({ token, businessId, groupId, notes: 'Registrado desde el panel' });
    setBusy(false);
    if (!result.success) return setError(result.error ?? 'No se pudo registrar el pago');
    setNotice('Pago manual registrado.');
    load();
  };

  const toggleExemption = async (exempt: boolean) => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    setBusy(true);
    setError(null);
    const result = await setVotingBillingExemptionAction({ token, businessId, exempt });
    setBusy(false);
    if (!result.success) return setError(result.error ?? 'No se pudo cambiar la exención');
    load();
  };

  if (!status) return error ? <VtNotice>{error}</VtNotice> : null;
  const view = votingBillingView(status);

  return (
    <div className="flex flex-col gap-2" aria-label="Pago del día de votación">
      {notice && <VtNotice tone="ok">{notice}</VtNotice>}
      {error && <VtNotice>{error}</VtNotice>}

      {view.kind === 'due' && (
        <div
          className="flex flex-col md:flex-row md:items-center gap-3 rounded-lg px-3.5 py-3"
          style={{ background: VT.missingBg, border: `1px solid #f1cfc4`, color: '#9c3a22' }}
        >
          <div className="flex-1 text-[13px] leading-snug">
            <strong>Pago pendiente: {plural(view.days)} · {view.amount}</strong>
            <div>Puedes preparar todo; las votaciones se abren y reciben votos cuando el pago esté aprobado.</div>
            {!view.canPayOnline && <div>El pago en línea todavía no está disponible.</div>}
            {view.pendingAttempt && <div>Hay un intento de pago sin confirmar.</div>}
          </div>
          <div className="flex gap-2 flex-wrap">
            {view.canPayOnline && (
              <button type="button" className={vtBtn.primary} onClick={pay} disabled={busy}>
                {busy ? 'Abriendo Wompi…' : `Pagar ${view.amount} con Wompi`}
              </button>
            )}
            {isSuperAdmin && (
              <button type="button" className={vtBtn.secondary} onClick={registerManual} disabled={busy}>
                Registrar pago manual
              </button>
            )}
          </div>
        </div>
      )}

      {view.kind === 'paid' && (
        <div className="text-xs" style={{ color: VT.reachedFg }}>
          ✓ Día de votación pagado ({plural(view.days)})
        </div>
      )}

      {isSuperAdmin && (
        <div className="text-xs flex items-center gap-2" style={{ color: VT.muted }}>
          {status.exempt ? 'Propiedad exenta de cobro.' : 'Propiedad con cobro por día de votación.'}
          <button type="button" className="underline" onClick={() => toggleExemption(!status.exempt)} disabled={busy}>
            {status.exempt ? 'Cobrarle' : 'Exentar'}
          </button>
        </div>
      )}
    </div>
  );
}
