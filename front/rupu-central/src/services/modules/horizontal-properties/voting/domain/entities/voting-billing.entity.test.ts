import { describe, expect, it } from 'vitest';
import { coverageView, datesToCover, formatCop, formatVotingDate, type VotingCoverage } from './voting-billing.entity';

const base = (over: Partial<VotingCoverage> = {}): VotingCoverage => ({
  businessId: 1,
  today: '2026-10-22',
  todayCovered: false,
  propertyExempt: false,
  adminExempt: false,
  membership: null,
  purchasedDates: [],
  assemblies: [],
  pricePerDayCop: 50000,
  gatewayEnabled: true,
  recentPurchases: [],
  ...over,
});

describe('formato', () => {
  it('pesos y fechas en español', () => {
    expect(formatCop(1400000)).toBe('$1.400.000');
    expect(formatVotingDate('2026-10-24')).toBe('sáb 24 oct');
  });
});

describe('datesToCover', () => {
  it('une las fechas sin cubrir de todas las asambleas, sin repetir y en orden', () => {
    const c = base({ assemblies: [
      { groupId: 1, name: 'A', dates: [], uncoveredDates: ['2026-10-25', '2026-10-24'] },
      { groupId: 2, name: 'B', dates: [], uncoveredDates: ['2026-10-24', '2026-10-30'] },
    ] });
    expect(datesToCover(c)).toEqual(['2026-10-24', '2026-10-25', '2026-10-30']);
  });
});

describe('coverageView', () => {
  it('exenta por la propiedad o por su administradora', () => {
    expect(coverageView(base({ propertyExempt: true }))).toEqual({ kind: 'exempt', by: 'property' });
    expect(coverageView(base({ adminExempt: true }))).toEqual({ kind: 'exempt', by: 'admin' });
  });

  it('con fechas sin cubrir muestra cuántas y el total', () => {
    const v = coverageView(base({ assemblies: [{ groupId: 1, name: 'A', dates: [], uncoveredDates: ['2026-10-24', '2026-10-25'] }] }));
    expect(v).toEqual({ kind: 'due', missing: ['2026-10-24', '2026-10-25'], total: 100000 });
  });

  it('con membresía avisa las fechas que quedan después de vencer', () => {
    const v = coverageView(base({ membership: { planCode: 'MONTH_1', endsAt: '2026-11-21T14:00:00Z' }, assemblies: [{ groupId: 1, name: 'A', dates: [], uncoveredDates: ['2026-11-22'] }] }));
    expect(v).toEqual({ kind: 'membership', endsAt: '2026-11-21T14:00:00Z', missing: ['2026-11-22'] });
  });

  it('sin asambleas pendientes queda al día', () => {
    expect(coverageView(base({ todayCovered: true }))).toEqual({ kind: 'ok', todayCovered: true });
  });
});
