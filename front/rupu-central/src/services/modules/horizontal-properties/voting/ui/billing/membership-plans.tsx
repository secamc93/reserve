/**
 * Planes de membresía: mes para un conjunto o planes de administradora (varios conjuntos, 30 días
 * de votaciones ilimitadas). Se elige el plan y los conjuntos, y se paga con Wompi. El super admin
 * además otorga planes sin cobro (cortesía), pagados por fuera (manual) o a la medida (CUSTOM).
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { TokenStorage } from '@shared/config';
import { useAccessibleProperties } from '@/shared/ui/use-accessible-properties';
import { createMembershipCheckoutAction, grantMembershipAction, listMembershipPlansAction } from '../../infrastructure/actions';
import { formatCop, type MembershipPlan } from '../../domain/entities';
import { VT, VtNotice, votingFontRoot, vtBtn, vtInput, vtMono } from '../design';
import { PAYMENT_PARAM } from './voting-coverage-banner';
import { useIsSuperAdmin } from './use-is-super-admin';

/** Conjuntos elegidos sin pasarse del tope del plan (los primeros que se marcaron). */
export function limitSelection(selected: number[], max: number): number[] {
  return selected.slice(0, Math.max(0, max));
}

export function MembershipPlans({ businessId }: { businessId: number }) {
  const isSuperAdmin = useIsSuperAdmin();
  const { properties, loading: loadingProps } = useAccessibleProperties();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [planCode, setPlanCode] = useState<string>('MONTH_1');
  const [selected, setSelected] = useState<number[]>([businessId]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [grantSource, setGrantSource] = useState<'cortesia' | 'manual'>('cortesia');
  const [customMax, setCustomMax] = useState(30);
  const [grantNotes, setGrantNotes] = useState('');

  useEffect(() => {
    const t = TokenStorage.getBusinessToken();
    if (!t) return;
    listMembershipPlansAction({ token: t }).then((r) => (r.success && r.data ? setPlans(r.data) : setError(r.error ?? 'No se pudieron cargar los planes')));
  }, []);

  const plan = plans.find((p) => p.code === planCode);
  const max = planCode === 'CUSTOM' ? customMax : plan?.maxProperties ?? 1;
  const chosen = useMemo(() => limitSelection(selected, max), [selected, max]);

  const toggle = (id: number) => {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length < max ? [...cur, id] : cur));
  };

  const pay = async () => {
    const t = TokenStorage.getBusinessToken();
    if (!t || !plan) return;
    setBusy(true);
    setError(null);
    const redirectUrl = `${window.location.origin}/properties/${businessId}/voting-groups?${PAYMENT_PARAM}=membresia`;
    const r = await createMembershipCheckoutAction({ token: t, planCode: plan.code, businessIds: chosen, redirectUrl });
    if (r.success && r.data) return window.location.assign(r.data.checkoutUrl);
    setBusy(false);
    setError(r.error ?? 'No se pudo iniciar el pago');
  };

  const grant = async () => {
    const t = TokenStorage.getBusinessToken();
    if (!t) return;
    setBusy(true);
    setError(null);
    const r = await grantMembershipAction({ token: t, planCode, maxProperties: planCode === 'CUSTOM' ? customMax : undefined, businessIds: chosen, source: grantSource, notes: grantNotes });
    setBusy(false);
    if (!r.success) return setError(r.error ?? 'No se pudo otorgar el plan');
    setNotice(`Plan otorgado a ${chosen.length} ${chosen.length === 1 ? 'conjunto' : 'conjuntos'} por 30 días.`);
  };

  return (
    <div className={`min-h-[calc(100vh-57px)] ${votingFontRoot}`} style={{ background: VT.paper, color: VT.ink }}>
      <div className="px-3 sm:px-8 py-4 md:py-7 flex flex-col gap-5 w-full max-w-5xl">
        <div>
          <Link href={`/properties/${businessId}/voting-groups`} className={`${vtMono} text-[11px] uppercase tracking-[.06em]`} style={{ color: VT.muted }}>
            ← Grupos de votación
          </Link>
          <h1 className="m-0 mt-1.5 text-xl md:text-2xl font-semibold tracking-[-.02em]">Planes de votaciones</h1>
          <p className="m-0 mt-1 text-[14px]" style={{ color: VT.inkSoft }}>
            30 días de votaciones ilimitadas en los conjuntos que elijas. Fuera del plan, cada día de votación cuesta $50.000.
          </p>
        </div>

        {notice && <VtNotice tone="ok">{notice}</VtNotice>}
        {error && <VtNotice>{error}</VtNotice>}

        <div role="radiogroup" aria-label="Plan" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => {
            const active = p.code === planCode;
            return (
              <button
                key={p.code}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPlanCode(p.code)}
                className="text-left rounded-[10px] bg-white px-4 py-4 transition-colors"
                style={{ border: `${active ? 2 : 1}px solid ${active ? VT.ink : VT.border}` }}
              >
                <div className="text-[14px] font-semibold">{p.name}</div>
                <div className="mt-1 text-2xl font-semibold tracking-[-.02em]">{formatCop(p.priceCop)}</div>
                <div className="text-[12px]" style={{ color: VT.muted }}>
                  {p.maxProperties > 1 ? `${formatCop(Math.round(p.priceCop / p.maxProperties))} por conjunto · ` : ''}{p.durationDays} días
                </div>
              </button>
            );
          })}
          {isSuperAdmin && (
            <button type="button" role="radio" aria-checked={planCode === 'CUSTOM'} onClick={() => setPlanCode('CUSTOM')}
              className="text-left rounded-[10px] bg-white px-4 py-4" style={{ border: `${planCode === 'CUSTOM' ? 2 : 1}px solid ${planCode === 'CUSTOM' ? VT.ink : VT.border}` }}>
              <div className="text-[14px] font-semibold">A la medida (super admin)</div>
              <div className="text-[12px] mt-1" style={{ color: VT.muted }}>Más de 20 conjuntos o acuerdos especiales; solo se otorga.</div>
            </button>
          )}
        </div>

        <section aria-label="Conjuntos" className="rounded-[10px] bg-white px-4 py-4" style={{ border: `1px solid ${VT.border}` }}>
          <div className="text-[14px] font-semibold">Conjuntos cubiertos ({chosen.length} de {max})</div>
          {loadingProps ? (
            <div className="text-[13px] mt-2">Cargando conjuntos…</div>
          ) : (
            <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {properties.map((p) => {
                const checked = chosen.includes(p.id);
                const disabled = !checked && chosen.length >= max;
                return (
                  <label key={p.id} className="flex items-center gap-2 text-[14px]" style={{ opacity: disabled ? 0.5 : 1 }}>
                    <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(p.id)} />
                    {p.name}
                  </label>
                );
              })}
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-2 items-center">
          {plan && (
            <button type="button" className={vtBtn.primary} disabled={busy || chosen.length === 0} onClick={pay}>
              {busy ? 'Abriendo Wompi…' : `Pagar ${formatCop(plan.priceCop)} con Wompi`}
            </button>
          )}
        </div>

        {isSuperAdmin && (
          <section aria-label="Otorgar plan" className="rounded-[10px] px-4 py-4 flex flex-col gap-2" style={{ background: '#faf9f7', border: `1px dashed ${VT.borderStrong}` }}>
            <div className="text-[14px] font-semibold">Super admin · otorgar sin pasarela</div>
            <div className="grid gap-2 sm:grid-cols-3">
              <label className="text-[13px] font-medium">Origen
                <select className={`${vtInput} mt-1`} value={grantSource} onChange={(e) => setGrantSource(e.target.value as 'cortesia' | 'manual')}>
                  <option value="cortesia">Cortesía (sin cobro)</option>
                  <option value="manual">Pago manual</option>
                </select>
              </label>
              {planCode === 'CUSTOM' && (
                <label className="text-[13px] font-medium">Máximo de conjuntos
                  <input type="number" min={1} className={`${vtInput} mt-1`} value={customMax} onChange={(e) => setCustomMax(Math.max(1, Number(e.target.value) || 1))} />
                </label>
              )}
              <label className="text-[13px] font-medium">Notas
                <input className={`${vtInput} mt-1`} value={grantNotes} maxLength={500} onChange={(e) => setGrantNotes(e.target.value)} placeholder="Motivo o referencia" />
              </label>
            </div>
            <div>
              <button type="button" className={vtBtn.secondary} disabled={busy || chosen.length === 0} onClick={grant}>Otorgar plan</button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
