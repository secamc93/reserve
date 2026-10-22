/**
 * S1 · Resumen de hoy de la propiedad ("PH - Shell y Resumen"): qué está pasando hoy — visitas
 * dentro, paquetes por entregar, reservas del día, la votación activa y la ocupación — cada uno
 * con acceso directo a su módulo.
 */

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DsCard, DsEyebrow, dsMono } from '@shared/ui/ds';
import type { TodaySummary } from '../domain/entities';
import { buildKpis, elapsedSince, pct, todayEyebrow } from './today-view-model';

const unitLabel = (block: string, number: string) => (number ? (block ? `${block} ${number}` : number) : '—');

export function TodayView({ summary, propertyName, basePath }: { summary: TodaySummary; propertyName: string; basePath: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const kpis = buildKpis(summary, basePath);
  const v = summary.activeVoting;
  const participation = v ? pct(v.votedUnits, v.totalUnits) : 0;
  const o = summary.occupancy;

  return (
    <div className="flex flex-col gap-[22px]">
      <div>
        <DsEyebrow className="mb-1.5 !text-[11px]">{todayEyebrow(now)}</DsEyebrow>
        <h1 className="m-0 text-2xl font-semibold tracking-[-.02em]">Hoy en {propertyName}</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="bg-white border border-[#e4e2dd] rounded-[20px] shadow-[0_1px_2px_rgba(0,0,0,.04),0_4px_14px_rgba(0,0,0,.05)] px-[18px] py-4 flex flex-col gap-2 hover:border-[#c9c6c0] transition-colors">
            <div className="flex justify-between items-center gap-2">
              <span className={`${dsMono} text-[10px] tracking-[.06em] text-[#8a8580]`}>{k.label}</span>
              <span className="text-[11px] text-[#8a8580] hidden md:inline">{k.link} →</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`${dsMono} text-[34px] font-semibold tracking-[-.04em] leading-none`}>{k.value}</span>
              <span className="text-xs text-[#4b4a46]">{k.unit}</span>
            </div>
            <div className="text-xs" style={{ color: k.subColor }}>{k.sub}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-3.5 lg:grid-cols-[1fr_1fr_380px]">
        <DsCard className="flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e4e2dd] flex justify-between items-center">
            <span className="text-[13px] font-semibold">Visitas dentro ahora</span>
            <span className={`${dsMono} text-[11px] text-[#8a8580]`}>{summary.visitsInsideCount} personas</span>
          </div>
          {summary.visitsInside.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#8a8580]">No hay visitas dentro.</p>
          ) : (
            summary.visitsInside.map((visit, i) => (
              <div key={i} className="grid grid-cols-[1fr_80px_70px] gap-2.5 px-4 py-2.5 border-b border-[#efedea] last:border-b-0 items-center text-[13px]">
                <div className="min-w-0">
                  <div className="font-medium truncate">{visit.visitorName || 'Visitante'}</div>
                  <div className="text-[11px] text-[#8a8580]">{visit.visitType || 'Visita'}</div>
                </div>
                <span className={`${dsMono} text-xs truncate`}>{unitLabel(visit.unitBlock, visit.unitNumber)}</span>
                <span className={`${dsMono} text-xs text-right`} style={{ color: visit.exceeded ? '#c8603f' : '#1a1a1a' }}>
                  {elapsedSince(visit.entryTime, now)}
                </span>
              </div>
            ))
          )}
        </DsCard>

        <DsCard className="flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e4e2dd] flex justify-between items-center">
            <span className="text-[13px] font-semibold">Reservas de hoy</span>
            <Link href={`${basePath}/common-areas`} className="text-[11px] text-[#8a8580] hover:text-[#c8603f]">Calendario →</Link>
          </div>
          {summary.reservationsToday.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[#8a8580]">No hay reservas de zonas comunes hoy.</p>
          ) : (
            summary.reservationsToday.map((r, i) => (
              <div key={i} className="grid grid-cols-[86px_1fr_auto] gap-2.5 px-4 py-2.5 border-b border-[#efedea] last:border-b-0 items-center text-[13px]">
                <span className={`${dsMono} text-xs text-[#4b4a46]`}>{r.startTime.slice(0, 5)}–{r.endTime.slice(0, 5)}</span>
                <div className="min-w-0">
                  <div className="font-medium truncate">{r.areaName}</div>
                  <div className="text-[11px] text-[#8a8580]">{unitLabel(r.unitBlock, r.unitNumber)}</div>
                </div>
                <span
                  className="px-[7px] py-0.5 rounded-full text-[10px] font-semibold"
                  style={r.approved ? { background: '#e3f1e8', color: '#1f8a4c' } : { background: '#fbe9e4', color: '#c8603f' }}
                >
                  {r.approved ? 'Aprobada' : 'Pendiente'}
                </span>
              </div>
            ))
          )}
        </DsCard>

        <div className="flex flex-col gap-3.5">
          {v ? (
            <div className="text-white rounded-[20px] px-[18px] py-4 flex flex-col gap-3 bg-[linear-gradient(135deg,#0F7F8A_0%,#0A5D66_100%)] shadow-[0_1px_2px_rgba(15,127,138,.18),0_8px_24px_rgba(15,127,138,.25)]">
              <div className="flex justify-between items-center">
                <span className={`${dsMono} text-[10px] tracking-[.06em] text-white/55`}>VOTACIÓN ACTIVA</span>
                <span className={`${dsMono} inline-flex items-center gap-1.5 text-[10px] text-[#f08a73] tracking-[.06em]`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f08a73] animate-pulse" />
                  EN VIVO
                </span>
              </div>
              <div className="text-[15px] font-semibold leading-tight">{v.title}</div>
              <div className="relative h-2.5">
                <div className="h-full rounded-full overflow-hidden bg-white/20">
                  <div className="h-full rounded-full bg-[#2CD8CC]" style={{ width: `${participation}%` }} />
                </div>
                {v.quorumPercentage !== null && (
                  <div className="absolute -top-1 -bottom-1 w-0.5 bg-[#f08a73]" style={{ left: `${Math.min(100, v.quorumPercentage)}%` }} aria-hidden="true" />
                )}
              </div>
              <div className="flex justify-between text-[11px] text-white/70">
                <span>
                  Participación <strong className="text-white">{participation}%</strong> · {v.votedUnits}/{v.totalUnits}
                </span>
                {v.quorumPercentage !== null && <span>quórum {v.quorumPercentage}%</span>}
              </div>
              <Link
                href={`${basePath}/voting-groups/${v.groupId}/votings/${v.votingId}/live`}
                className="block text-center h-9 leading-9 rounded-full bg-white text-[#0C6B76] text-[13px] font-semibold hover:bg-[#E3F5F5] transition-colors"
              >
                Abrir panel en vivo
              </Link>
            </div>
          ) : (
            <DsCard className="px-[18px] py-4">
              <DsEyebrow>Votaciones</DsEyebrow>
              <p className="mt-2 text-sm text-[#4b4a46]">No hay una votación activa.</p>
              <Link href={`${basePath}/voting-groups`} className="mt-2 inline-block text-xs text-[#8a8580] hover:text-[#c8603f]">Ir a votaciones →</Link>
            </DsCard>
          )}

          <DsCard className="px-[18px] py-3.5 flex flex-col gap-2.5">
            <span className="text-[13px] font-semibold">Ocupación</span>
            {[
              { label: 'Unidades con residente', part: o.unitsWithResident, total: o.units },
              { label: 'Cupos de parqueo asignados', part: o.parkingAssigned, total: o.parkingSlots },
              { label: 'Residentes con correo', part: o.residentsWithEmail, total: o.residents },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#4b4a46]">{row.label}</span>
                  <span className={dsMono}>{row.part} / {row.total}</span>
                </div>
                <div className="h-1.5 bg-[#efedea] rounded-full" aria-hidden="true">
                  <div className="h-full bg-[#18A0AE] rounded-full" style={{ width: `${pct(row.part, row.total)}%` }} />
                </div>
              </div>
            ))}
          </DsCard>
        </div>
      </div>
    </div>
  );
}
