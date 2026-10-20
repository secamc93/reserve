/**
 * R4 · Detalle del residente (Patrón C: panel lateral de 460 px): cabecera con la unidad y
 * "Editar"; avatar, nombre y pill PRINCIPAL; tipo · documento · desde; correo y teléfono;
 * cifras (visitas 30 d, paquetes, reservas, votó); "En la unidad" (otros residentes);
 * "Actividad reciente"; y accesos a Registrar visita / Recibir paquete / Reservar zona.
 */

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { TokenStorage } from '@shared/config';
import { DS, DsEyebrow, VtNotice, dsMono, vtBtn } from '@shared/ui/ds';
import { getResidentByIdAction, getResidentOverviewAction } from '../infrastructure/actions';
import type { Resident, ResidentActivityKind, ResidentOverview } from '../domain';
import { formatActivityDate, residentSubtitle } from '../domain';
import { formatUnitLabel } from '../../units/domain';
import { DsAvatar, DsSidePanel } from '@shared/ui/ds';

const ACTIVITY_ICON: Record<ResidentActivityKind, string> = {
  package: 'M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8',
  visit: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6',
  reservation: 'M3 10h18M8 3v4M16 3v4M5 6h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z',
  vote: 'M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11',
  parking: 'M5 21V3h8a5 5 0 010 10H5',
};

function ActivityIcon({ kind }: { kind: ResidentActivityKind }) {
  return (
    <span className="w-7 h-7 rounded-xl bg-[#f5f5f4] border border-[#e4e2dd] inline-flex items-center justify-center text-[#4b4a46] shrink-0" aria-hidden="true">
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d={ACTIVITY_ICON[kind] ?? ACTIVITY_ICON.visit} />
      </svg>
    </span>
  );
}

function StatCard({ label, value, color }: { label: string; value: React.ReactNode; color?: string }) {
  return (
    <div className="rounded-2xl border border-[#e4e2dd] px-2.5 py-2 min-w-0">
      <DsEyebrow className="text-[9px]!">{label}</DsEyebrow>
      <div className={`${dsMono} text-lg font-semibold mt-0.5`} style={color ? { color } : undefined}>{value}</div>
    </div>
  );
}

export function ResidentDetailPanel({
  businessId,
  resident,
  onClose,
  onEdit,
}: {
  businessId: number;
  /** Fila del listado (trae el bloque de la unidad y "desde"). */
  resident: Resident | null;
  onClose: () => void;
  onEdit: (resident: Resident) => void;
}) {
  const [detail, setDetail] = useState<Resident | null>(null);
  const [overview, setOverview] = useState<ResidentOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resident) return;
    let cancelled = false;
    setDetail(null);
    setOverview(null);
    setError(null);
    setLoading(true);
    (async () => {
      const token = TokenStorage.getBusinessToken();
      if (!token) {
        setError('La sesión expiró');
        setLoading(false);
        return;
      }
      const [full, ov] = await Promise.allSettled([
        getResidentByIdAction({ businessId, residentId: resident.id, token }),
        getResidentOverviewAction({ businessId, residentId: resident.id, token }),
      ]);
      if (cancelled) return;
      if (full.status === 'fulfilled') setDetail(full.value);
      if (ov.status === 'fulfilled') setOverview(ov.value);
      if (full.status === 'rejected' && ov.status === 'rejected') setError('No se pudo cargar el detalle del residente');
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [businessId, resident]);

  if (!resident) return null;
  const r: Resident = { ...resident, ...(detail ?? {}), propertyUnitBlock: resident.propertyUnitBlock, since: resident.since };
  const unitLabel = formatUnitLabel(r.propertyUnitNumber || resident.propertyUnitNumber, resident.propertyUnitBlock);
  const stats = overview?.stats;
  const base = `/properties/${businessId}`;

  return (
    <DsSidePanel
      open
      width={460}
      onClose={onClose}
      eyebrow={<span className={dsMono}>Residente · {unitLabel}</span>}
      title={<span className="sr-only">{r.name}</span>}
      headerActions={
        <button type="button" className={vtBtn.small} onClick={() => onEdit(resident)}>Editar</button>
      }
      footer={
        <>
          <Link href={`${base}/visits`} className={vtBtn.secondary}>Registrar visita</Link>
          <Link href={`${base}/packages`} className={vtBtn.secondary}>Recibir paquete</Link>
          <Link href={`${base}/common-areas`} className={vtBtn.secondary}>Reservar zona</Link>
        </>
      }
    >
      {error && <VtNotice>{error}</VtNotice>}

      <div className="flex items-center gap-3.5">
        <DsAvatar name={r.name} size={48} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold tracking-[-.01em]">{r.name}</span>
            {r.isMainResident && <span className="px-2 py-0.5 rounded-full bg-[#E3F5F5] text-[#0C6B76] text-[9px] font-bold tracking-[.06em]">PRINCIPAL</span>}
          </div>
          <div className="text-xs text-[#8a8580] mt-0.5">{residentSubtitle(r)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-[#e4e2dd] px-3 py-2 min-w-0">
          <DsEyebrow>Correo</DsEyebrow>
          {r.email ? (
            <a href={`mailto:${r.email}`} className="block text-[13px] truncate hover:underline mt-0.5">{r.email}</a>
          ) : (
            <span className="block text-[13px] mt-0.5" style={{ color: DS.accent }}>sin correo</span>
          )}
        </div>
        <div className="rounded-2xl border border-[#e4e2dd] px-3 py-2 min-w-0">
          <DsEyebrow>Teléfono</DsEyebrow>
          {r.phone ? (
            <a href={`tel:${r.phone}`} className={`${dsMono} block text-[13px] truncate hover:underline mt-0.5`}>{r.phone}</a>
          ) : (
            <span className="block text-[13px] text-[#8a8580] mt-0.5">—</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2" aria-label="Cifras del residente">
        <StatCard label="Visitas 30 d" value={stats ? stats.visits30d : '—'} />
        <StatCard label="Paquetes" value={stats ? stats.packagesPending : '—'} color={stats && stats.packagesPending > 0 ? DS.accent : undefined} />
        <StatCard label="Reservas" value={stats ? stats.reservations : '—'} />
        <StatCard label="Votó" value={stats ? (stats.votesTotal > 0 ? `${stats.votesCast}/${stats.votesTotal}` : '—') : '—'} />
      </div>

      <section className="flex flex-col gap-2">
        <DsEyebrow>En la unidad</DsEyebrow>
        {loading && !overview ? (
          <div className="text-[13px] text-[#8a8580]">Cargando…</div>
        ) : overview && overview.housemates.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {overview.housemates.map((h) => (
              <li key={h.id} className="flex items-center gap-2.5">
                <DsAvatar name={h.name} size={28} />
                <span className="text-[13px] font-medium truncate">{h.name}</span>
                <span className="text-xs text-[#8a8580] ml-auto shrink-0">{h.typeName}{h.isMain ? ' · principal' : ''}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-[13px] text-[#8a8580]">Vive solo en {unitLabel}</div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <DsEyebrow>Actividad reciente</DsEyebrow>
        {loading && !overview ? (
          <div className="text-[13px] text-[#8a8580]">Cargando…</div>
        ) : overview && overview.activity.length > 0 ? (
          <ul className="flex flex-col gap-2.5" aria-label="Actividad reciente">
            {overview.activity.map((a, i) => (
              <li key={`${a.kind}-${a.at}-${i}`} className="flex items-start gap-2.5">
                <ActivityIcon kind={a.kind} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium">{a.title}</div>
                  {a.subtitle && <div className="text-xs text-[#8a8580] truncate">{a.subtitle}</div>}
                </div>
                <span className={`${dsMono} text-[11px] text-[#8a8580] whitespace-nowrap`}>{formatActivityDate(a.at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-[13px] text-[#8a8580]">Sin actividad reciente</div>
        )}
      </section>
    </DsSidePanel>
  );
}
