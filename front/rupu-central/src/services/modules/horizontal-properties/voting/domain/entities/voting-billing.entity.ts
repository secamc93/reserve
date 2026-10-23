/**
 * Cobro de votaciones: días comprados, membresías y exenciones de una propiedad.
 */

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';

export interface DayPurchase {
  id: number;
  reference: string;
  source: 'wompi' | 'manual' | 'cortesia';
  dates: string[];
  amountInCents: number;
  status: PaymentStatus;
  paymentMethodType?: string;
  createdAt: string;
}

export interface AssemblyCoverage {
  groupId: number;
  name: string;
  dates: string[];
  uncoveredDates: string[];
}

export interface VotingCoverage {
  businessId: number;
  today: string;
  todayCovered: boolean;
  propertyExempt: boolean;
  adminExempt: boolean;
  membership: { planCode: string; endsAt: string } | null;
  purchasedDates: string[];
  assemblies: AssemblyCoverage[];
  pricePerDayCop: number;
  gatewayEnabled: boolean;
  recentPurchases: DayPurchase[];
}

export interface PropertyAdmin {
  userId: number;
  name: string;
  email: string;
  exempt: boolean;
}

export interface MembershipPlan {
  code: string;
  name: string;
  maxProperties: number;
  priceCop: number;
  durationDays: number;
}

export interface Membership {
  id: number;
  planCode: string;
  maxProperties: number;
  status: 'PENDING' | 'ACTIVE' | 'CANCELLED';
  source: 'wompi' | 'manual' | 'cortesia';
  startsAt?: string;
  endsAt?: string;
  businessIds: number[];
}

/** Pesos colombianos sin decimales: 50000 → "$50.000". */
export function formatCop(pesos: number): string {
  return '$' + Math.round(pesos).toLocaleString('es-CO');
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

/** "2026-10-24" → "sáb 24 oct" (sin zona horaria: la fecha ya es de Colombia). */
export function formatVotingDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday} ${d} ${MONTHS[m - 1]}`;
}

/** Fechas de las asambleas próximas que faltan por cubrir, sin repetir y en orden. */
export function datesToCover(coverage: VotingCoverage): string[] {
  return [...new Set(coverage.assemblies.flatMap((a) => a.uncoveredDates))].sort();
}

/** Qué mostrar en el aviso de cobro de la propiedad. */
export type CoverageView =
  | { kind: 'exempt'; by: 'property' | 'admin' }
  | { kind: 'membership'; endsAt: string; missing: string[] }
  | { kind: 'due'; missing: string[]; total: number }
  | { kind: 'ok'; todayCovered: boolean };

export function coverageView(c: VotingCoverage): CoverageView {
  if (c.propertyExempt || c.adminExempt) return { kind: 'exempt', by: c.propertyExempt ? 'property' : 'admin' };
  const missing = datesToCover(c);
  if (c.membership) return { kind: 'membership', endsAt: c.membership.endsAt, missing };
  if (missing.length > 0) return { kind: 'due', missing, total: missing.length * c.pricePerDayCop };
  return { kind: 'ok', todayCovered: c.todayCovered };
}
