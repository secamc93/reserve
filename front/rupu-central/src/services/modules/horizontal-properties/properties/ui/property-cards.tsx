/**
 * "Elige una propiedad": una tarjeta por conjunto con su dirección, descripción y el estado de su
 * información para asambleas (unidades, coeficientes que deben sumar 100 % y residentes), además de
 * lo que le falta. El super admin ve el resumen de todas; un usuario normal, el de su propiedad
 * activa (su token solo vale para ella).
 */

'use client';

import { useEffect, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { PropertyLogo, Spinner, selectProperty } from '@shared/ui';
import { DS, dsFontRoot, dsMono } from '@shared/ui/ds';
import type { PropertyOption } from '@/shared/utils/properties';
import { getPropertyOverviewAction } from '../infrastructure/actions';
import type { PropertyOverview } from '../domain/entities';

type OverviewState = PropertyOverview | 'loading' | 'error' | 'hidden';

/** Qué le falta a la propiedad para hacer asambleas (o que ya está lista). */
export function readiness(o: PropertyOverview): { ok: boolean; text: string } {
  if (o.units === 0) return { ok: false, text: 'Falta cargar las unidades (Unidades → Importar Excel)' };
  if (Math.abs(o.coefficientSum - 100) > 0.5) return { ok: false, text: `Los coeficientes suman ${formatPct(o.coefficientSum)}: deben sumar 100 %` };
  if (o.residents === 0) return { ok: false, text: 'Falta cargar los residentes (Residentes → Importar Excel)' };
  return { ok: true, text: 'Lista para asambleas' };
}

export function formatPct(n: number): string {
  return `${n.toLocaleString('es-CO', { maximumFractionDigits: 2 })} %`;
}

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'ok' | 'warn' }) {
  const color = tone === 'ok' ? DS.reachedFg : tone === 'warn' ? DS.missingFg : DS.ink;
  return (
    <div className="min-w-0">
      <div className={`${dsMono} text-[10px] uppercase tracking-[.06em]`} style={{ color: DS.muted }}>{label}</div>
      <div className="text-[18px] font-semibold leading-tight tabular-nums" style={{ color }}>{value}</div>
      {hint && <div className="text-[11px] truncate" style={{ color: DS.muted }}>{hint}</div>}
    </div>
  );
}

export function PropertyCards({ properties, activeId }: { properties: PropertyOption[]; activeId: number | null }) {
  const [overviews, setOverviews] = useState<Record<number, OverviewState>>({});
  const [opening, setOpening] = useState<number | null>(null);
  const [selectError, setSelectError] = useState<string | null>(null);

  useEffect(() => {
    const token = TokenStorage.getBusinessToken();
    const isSuperAdmin = Boolean(TokenStorage.getUser()?.is_super_admin);
    let alive = true;
    const initial: Record<number, OverviewState> = {};
    for (const p of properties) initial[p.id] = token && (isSuperAdmin || p.id === activeId) ? 'loading' : 'hidden';
    setOverviews(initial);
    for (const p of properties) {
      if (initial[p.id] !== 'loading' || !token) continue;
      getPropertyOverviewAction({ token, businessId: p.id }).then((r) => {
        if (alive) setOverviews((cur) => ({ ...cur, [p.id]: r.success ? r.data : 'error' }));
      });
    }
    return () => { alive = false; };
  }, [properties, activeId]);

  const open = async (property: PropertyOption) => {
    setOpening(property.id);
    setSelectError(null);
    const res = await selectProperty(property);
    if (!res.success) {
      setSelectError(res.error || 'No se pudo abrir la propiedad');
      setOpening(null);
    }
  };

  return (
    <div className={dsFontRoot}>
      {selectError && <p role="alert" className="mb-3 text-sm text-red-700">{selectError}</p>}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Propiedades">
        {properties.map((p) => {
          const o = overviews[p.id];
          const data = o && typeof o === 'object' ? o : null;
          const ready = data ? readiness(data) : null;
          const brand = p.primaryColor || DS.brand;
          const current = activeId === p.id;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => open(p)}
                disabled={opening !== null}
                aria-label={`Abrir ${p.name}`}
                className="group w-full text-left rounded-[18px] bg-white overflow-hidden transition-shadow hover:shadow-[0_10px_30px_-12px_rgba(0,0,0,.25)] disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{ border: `${current ? 2 : 1}px solid ${current ? DS.ink : DS.border}` }}
              >
                <div className="h-16 relative" style={{ background: `linear-gradient(120deg, ${brand}, ${brand}99)` }}>
                  {current && (
                    <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: DS.ink }}>
                      Propiedad actual
                    </span>
                  )}
                </div>
                <div className="px-5 pb-5 -mt-7">
                  <div className="flex items-end gap-3">
                    <span className="inline-flex rounded-full ring-4 ring-white bg-white shrink-0 overflow-hidden">
                      <PropertyLogo name={p.name} logoUrl={p.logoUrl} size={56} />
                    </span>
                    {opening === p.id && <Spinner size="sm" />}
                  </div>
                  <h2 className="m-0 mt-2 text-[17px] font-semibold leading-snug truncate" style={{ color: DS.ink }}>{p.name}</h2>
                  <p className="m-0 mt-0.5 text-[13px] truncate" style={{ color: DS.muted }}>
                    {data ? data.address || 'Sin dirección registrada' : o === 'hidden' ? 'Ábrela para ver su información' : ' '}
                  </p>
                  {data?.description && (
                    <p className="m-0 mt-2 text-[13px] leading-snug line-clamp-2" style={{ color: DS.inkSoft }}>{data.description}</p>
                  )}

                  {o === 'loading' && (
                    <div className="mt-4 grid grid-cols-3 gap-3" aria-hidden>
                      {[0, 1, 2].map((i) => <div key={i} className="h-11 rounded-lg animate-pulse" style={{ background: DS.paper }} />)}
                    </div>
                  )}
                  {data && (
                    <>
                      <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl px-3 py-2.5" style={{ background: DS.paper }}>
                        <Stat label="Unidades" value={String(data.units)} />
                        <Stat label="Residentes" value={String(data.residents)} hint={data.residents ? `${data.owners} prop. · ${data.tenants} arr.` : undefined} />
                        <Stat
                          label="Coeficiente"
                          value={data.units ? formatPct(data.coefficientSum) : '—'}
                          tone={data.units ? (Math.abs(data.coefficientSum - 100) <= 0.5 ? 'ok' : 'warn') : undefined}
                        />
                      </div>
                      <p className="m-0 mt-3 text-[12px] font-medium flex items-center gap-1.5" style={{ color: ready!.ok ? DS.reachedFg : DS.missingFg }}>
                        <span aria-hidden>{ready!.ok ? '✓' : '!'}</span> {ready!.text}
                      </p>
                    </>
                  )}
                  {o === 'error' && <p className="m-0 mt-3 text-[12px]" style={{ color: DS.muted }}>No se pudo cargar el resumen.</p>}

                  <div className="mt-4 text-[13px] font-semibold flex items-center gap-1" style={{ color: DS.brand }}>
                    {current ? 'Seguir en esta propiedad' : 'Abrir propiedad'}
                    <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
