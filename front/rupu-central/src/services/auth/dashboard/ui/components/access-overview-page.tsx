/**
 * Resumen de accesos (rediseño IAM 2c): cifras clave, lo que requiere atención (usuarios sin rol,
 * cuentas sin uso, inactivas) y cuántos usuarios tiene cada propiedad por rol.
 *
 * Las cifras generales salen de /dashboard/stats; la atención y el reparto por propiedad, de la
 * lista de usuarios (hasta 200, el máximo por página).
 */

'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { TokenStorage } from '@shared/config';
import { IamPage, IamPageHeader } from '@shared/ui/iam-navigation';
import { DsCard, VtNotice, vtBtn } from '@shared/ui/ds';
import { dsMono } from '@shared/ui/ds/fonts';
import { getUsersAction } from '@/services/auth/users/infrastructure/actions';
import type { UserListItem } from '@/services/auth/users/domain/entities/user-list.entity';
import { STALE_DAYS, lastAccessLabel, summarizeUsers, type UsersOverview } from '@/services/auth/users/domain/entities/users-overview.entity';
import { useDashboard } from '../hooks/use-dashboard';

const SCAN_LIMIT = 200;

function Kpi({ label, value, hint, tone = 'plain' }: { label: string; value: ReactNode; hint?: ReactNode; tone?: 'plain' | 'warn' }) {
  const warn = tone === 'warn';
  return (
    <div className={`rounded-[20px] p-[18px] flex flex-col gap-1.5 border ${warn ? 'bg-[#fbe9e4] border-[#efcfc3]' : 'bg-white border-[#e4e2dd] shadow-[0_1px_2px_rgba(0,0,0,.04),0_4px_14px_rgba(0,0,0,.05)]'}`}>
      <span className={`text-[13px] ${warn ? 'text-[#8a3d24] font-semibold' : 'text-[#4b4a46]'}`}>{label}</span>
      <span className={`${dsMono} text-[32px] leading-none font-medium ${warn ? 'text-[#8a3d24]' : ''}`}>{value}</span>
      {hint && <span className={`text-xs ${warn ? 'text-[#8a3d24]' : 'text-[#6b6660]'}`}>{hint}</span>}
    </div>
  );
}

function AttentionItem({ mark, tone, title, desc, cta, href }: { mark: string; tone: 'warn' | 'brand' | 'plain'; title: string; desc: ReactNode; cta: string; href: string }) {
  const icon = { warn: 'bg-[#fbe9e4] text-[#9a4528]', brand: 'bg-[#E3F5F5] text-[#0C6B76]', plain: 'bg-[#f0eeeb] text-[#4b4a46]' }[tone];
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-[#efedea] last:border-b-0">
      <div className="flex gap-3 items-start min-w-0">
        <span aria-hidden="true" className={`w-8 h-8 rounded-lg shrink-0 inline-flex items-center justify-center font-bold text-sm ${icon}`}>{mark}</span>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="font-semibold text-sm">{title}</span>
          <span className="text-[13px] text-[#4b4a46]">{desc}</span>
        </div>
      </div>
      <Link href={href} className={vtBtn.small}>{cta}</Link>
    </li>
  );
}

const names = (users: { name: string }[], max = 3) => {
  const shown = users.slice(0, max).map((u) => u.name).join(', ');
  return users.length > max ? `${shown} y ${users.length - max} más` : shown;
};

export function AccessOverviewPage() {
  const { stats, error: statsError } = useDashboard({ autoLoad: true });
  const [overview, setOverview] = useState<UsersOverview | null>(null);
  const [scanned, setScanned] = useState<{ count: number; total: number }>({ count: 0, total: 0 });
  const [usersError, setUsersError] = useState<string | null>(null);

  useEffect(() => {
    const token = TokenStorage.getBusinessToken();
    if (!token) return;
    getUsersAction({ token, page: 1, page_size: SCAN_LIMIT }).then((r) => {
      if (!r.success || !r.data) {
        setUsersError(r.error ?? 'No se pudo leer la lista de usuarios');
        return;
      }
      const users = r.data.users as UserListItem[];
      setOverview(summarizeUsers(users));
      setScanned({ count: users.length, total: r.data.count });
    });
  }, []);

  const attention = overview ? overview.withoutRole.length + overview.stale.length + overview.inactive : 0;
  const maxTotal = Math.max(1, ...(overview?.byProperty.map((p) => p.total) ?? [1]));

  return (
    <IamPage>
      <IamPageHeader
        title="Resumen"
        description="Lo que necesita tu atención hoy en usuarios y permisos."
        actions={
          <Link href="/iam/users" className={vtBtn.primary}>
            Ver usuarios
          </Link>
        }
      />

      {(statsError || usersError) && <VtNotice>{statsError ?? usersError}</VtNotice>}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
        <Kpi label="Usuarios activos" value={stats?.users.active ?? '—'} hint={stats ? `de ${stats.users.total} registrados` : undefined} />
        <Kpi label="Super admins" value={stats?.users.super_users ?? '—'} hint="Ven todas las propiedades" />
        <Kpi label="Roles" value={stats?.roles.total ?? '—'} hint={stats ? `${stats.roles.system} del sistema · ${stats.roles.custom} propios` : undefined} />
        <Kpi
          label="Sin rol asignado"
          value={overview?.withoutRole.length ?? '—'}
          tone={overview && overview.withoutRole.length > 0 ? 'warn' : 'plain'}
          hint={overview && overview.withoutRole.length > 0 ? 'Entran pero no ven ningún módulo' : 'Todos tienen rol'}
        />
      </div>

      <div className="flex flex-wrap gap-5 items-start">
        <div className="flex-[999_1_560px] min-w-0 flex flex-col gap-5">
          <DsCard className="overflow-hidden">
            <section aria-labelledby="iam-atencion">
              <h2 id="iam-atencion" className="m-0 px-5 py-4 text-base font-bold border-b border-[#e4e2dd]">Requiere atención</h2>
              {!overview ? (
                <p className="m-0 px-5 py-6 text-[13px] text-[#8a8580]">{usersError ? 'Sin datos.' : 'Revisando usuarios…'}</p>
              ) : attention === 0 ? (
                <p className="m-0 px-5 py-6 text-[13px] text-[#4b4a46]">Todo en orden: cada usuario activo tiene rol y entró en los últimos {STALE_DAYS} días.</p>
              ) : (
                <ul className="m-0 p-0 list-none">
                  {overview.withoutRole.length > 0 && (
                    <AttentionItem
                      mark="!"
                      tone="warn"
                      title={overview.withoutRole.length === 1 ? '1 usuario sin rol' : `${overview.withoutRole.length} usuarios sin rol`}
                      desc={names(overview.withoutRole)}
                      cta="Asignar rol"
                      href="/iam/users"
                    />
                  )}
                  {overview.stale.length > 0 && (
                    <AttentionItem
                      mark="z"
                      tone="plain"
                      title={overview.stale.length === 1 ? `1 cuenta sin uso en ${STALE_DAYS} días` : `${overview.stale.length} cuentas sin uso en ${STALE_DAYS} días`}
                      desc={`Considera desactivarlas para reducir riesgos. ${names(overview.stale)}.`}
                      cta="Revisar"
                      href="/iam/users?estado=activos"
                    />
                  )}
                  {overview.inactive > 0 && (
                    <AttentionItem
                      mark="—"
                      tone="brand"
                      title={overview.inactive === 1 ? '1 usuario inactivo' : `${overview.inactive} usuarios inactivos`}
                      desc="No pueden entrar. Actívalos si vuelven a necesitar acceso o elimínalos."
                      cta="Ver inactivos"
                      href="/iam/users?estado=inactivos"
                    />
                  )}
                </ul>
              )}
            </section>
          </DsCard>

          <DsCard className="overflow-hidden">
            <section aria-labelledby="iam-por-propiedad">
              <h2 id="iam-por-propiedad" className="m-0 px-5 py-4 text-base font-bold border-b border-[#e4e2dd]">Accesos por propiedad</h2>
              {overview && overview.byProperty.length === 0 && <p className="m-0 px-5 py-6 text-[13px] text-[#8a8580]">Nadie tiene rol en una propiedad todavía.</p>}
              {overview && overview.byProperty.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm min-w-[560px]">
                    <thead>
                      <tr className={`${dsMono} text-[10px] uppercase tracking-[.06em] text-[#8a8580]`}>
                        <th scope="col" className="text-left font-medium px-5 py-2.5 border-b border-[#e4e2dd]">Propiedad</th>
                        <th scope="col" className="text-left font-medium px-3 py-2.5 border-b border-[#e4e2dd]">Roles</th>
                        <th scope="col" className="text-left font-medium px-5 py-2.5 border-b border-[#e4e2dd] w-[30%]">Usuarios</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.byProperty.map((p) => (
                        <tr key={p.businessId}>
                          <th scope="row" className="text-left font-semibold px-5 py-3 border-b border-[#efedea]">
                            <Link href={`/iam/users?propiedad=${p.businessId}`} className="hover:text-[#0F7F8A]">{p.businessName}</Link>
                          </th>
                          <td className="px-3 py-3 border-b border-[#efedea]">
                            <div className="flex flex-wrap gap-1.5">
                              {p.roles.map((r) => (
                                <span key={r.roleName} className="inline-flex gap-1 px-2 py-0.5 rounded-md bg-[#f0eeeb] text-xs text-[#3d3c39]">
                                  {r.roleName} <span className={dsMono}>{r.count}</span>
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-3 border-b border-[#efedea]">
                            <div className="flex items-center gap-2.5">
                              <div className="flex-1 h-2 rounded bg-[#efedea] overflow-hidden" aria-hidden="true">
                                <div className="h-full rounded bg-[#18A0AE]" style={{ width: `${Math.round((p.total / maxTotal) * 100)}%` }} />
                              </div>
                              <span className={`${dsMono} text-[13px] w-7 text-right`}>{p.total}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {scanned.total > scanned.count && (
                <p className="m-0 px-5 py-3 text-xs text-[#6b6660] border-t border-[#efedea]">
                  Calculado con los primeros {scanned.count} de {scanned.total} usuarios.
                </p>
              )}
            </section>
          </DsCard>
        </div>

        <DsCard className="flex-[1_1_320px] p-5 flex flex-col gap-3.5">
          <section aria-labelledby="iam-sin-uso" className="flex flex-col gap-3.5">
            <h2 id="iam-sin-uso" className="m-0 text-base font-bold">Sin entrar hace tiempo</h2>
            {!overview && <span className="text-[13px] text-[#8a8580]">Revisando usuarios…</span>}
            {overview && overview.stale.length === 0 && <span className="text-[13px] text-[#4b4a46]">Todas las cuentas activas entraron en los últimos {STALE_DAYS} días.</span>}
            {overview?.stale.slice(0, 8).map((u) => (
              <div key={u.id} className="flex gap-3">
                <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#18A0AE] mt-1.5 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{u.name}</span>
                  <span className="text-xs text-[#6b6660]">Último acceso: {lastAccessLabel(u.last_login_at)}</span>
                </div>
              </div>
            ))}
            <Link href="/iam/users" className="text-[13px] font-semibold text-[#0F7F8A] hover:text-[#0C6B76]">Ir a usuarios →</Link>
          </section>
        </DsCard>
      </div>
    </IamPage>
  );
}
