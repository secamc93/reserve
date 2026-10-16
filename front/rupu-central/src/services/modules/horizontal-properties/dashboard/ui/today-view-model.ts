/** Lógica pura del Resumen de hoy (S1). */

import type { TodaySummary } from '../domain/entities';

const DAYS = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

/** "JUEVES 15 OCT 2026 · 10:42" */
export function todayEyebrow(now: Date): string {
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()} · ${hh}:${mm}`;
}

/** "12 min", "1 h 20", "3 h 05" desde la entrada. */
export function elapsedSince(entryISO: string, now: Date): string {
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(entryISO).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  return `${h} h ${String(minutes % 60).padStart(2, '0')}`;
}

export const pct = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);

export interface Kpi {
  label: string;
  value: string | number;
  unit: string;
  sub: string;
  subColor: string;
  link: string;
  href: string;
}

const OK = '#1f8a4c';
const WARN = '#c8603f';
const SOFT = '#4b4a46';

/** Las cuatro fichas de arriba, con su enlace al módulo. */
export function buildKpis(t: TodaySummary, base: string): Kpi[] {
  const v = t.activeVoting;
  const attendance = v?.attendanceByCoef ?? null;
  const quorum = v?.quorumPercentage ?? null;
  return [
    {
      label: 'VISITAS DENTRO',
      value: t.visitsInsideCount,
      unit: 'ahora',
      sub: t.visitsExceededCount > 0 ? `${t.visitsExceededCount} excede${t.visitsExceededCount === 1 ? '' : 'n'} su tiempo` : 'ninguna excede su tiempo',
      subColor: t.visitsExceededCount > 0 ? WARN : SOFT,
      link: 'Visitas',
      href: `${base}/visits`,
    },
    {
      label: 'PAQUETES POR ENTREGAR',
      value: t.packagesPending,
      unit: 'en portería',
      sub: t.packagesOld > 0 ? `${t.packagesOld} llevan más de 5 días` : 'ninguno con más de 5 días',
      subColor: t.packagesOld > 0 ? WARN : SOFT,
      link: 'Paquetería',
      href: `${base}/packages`,
    },
    {
      label: 'RESERVAS HOY',
      value: t.reservationsToday.length,
      unit: 'zonas',
      sub: t.reservationsPending > 0 ? `${t.reservationsPending} pendiente${t.reservationsPending === 1 ? '' : 's'} de aprobar` : 'sin pendientes',
      subColor: SOFT,
      link: 'Calendario',
      href: `${base}/common-areas`,
    },
    {
      label: 'ASISTENCIA ASAMBLEA',
      value: attendance === null ? '—' : `${Math.round(attendance)}%`,
      unit: 'coef.',
      sub: !v ? 'sin votación activa' : attendance === null ? 'sin lista de asistencia' : quorum !== null && attendance >= quorum ? 'quórum alcanzado' : quorum !== null ? `falta para el quórum (${quorum}%)` : 'asistencia registrada',
      subColor: v && attendance !== null && quorum !== null && attendance >= quorum ? OK : SOFT,
      link: 'Votaciones',
      href: `${base}/voting-groups`,
    },
  ];
}
