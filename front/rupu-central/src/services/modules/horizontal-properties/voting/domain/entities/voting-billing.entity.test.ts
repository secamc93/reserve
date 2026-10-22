import { describe, expect, it } from 'vitest';
import { formatCopFromCents, votingBillingView, type VotingBillingStatus } from './voting-billing.entity';

const status = (over: Partial<VotingBillingStatus> = {}): VotingBillingStatus => ({
  votingGroupId: 42,
  requiredDays: 2,
  paidDays: 0,
  dueDays: 2,
  pricePerDayCop: 50000,
  amountDueInCents: 10000000,
  exempt: false,
  paid: false,
  gatewayEnabled: true,
  payments: [],
  ...over,
});

describe('formatCopFromCents', () => {
  it('muestra pesos colombianos sin centavos', () => {
    expect(formatCopFromCents(5000000)).toBe('$50.000');
    expect(formatCopFromCents(10000000)).toBe('$100.000');
  });
});

describe('votingBillingView', () => {
  it('una propiedad exenta no ve el aviso', () => {
    expect(votingBillingView(status({ exempt: true, paid: true, dueDays: 0 }))).toEqual({ kind: 'hidden' });
  });

  it('con días pendientes muestra el monto y si se puede pagar en línea', () => {
    expect(votingBillingView(status())).toEqual({ kind: 'due', days: 2, amount: '$100.000', canPayOnline: true, pendingAttempt: false });
    expect(votingBillingView(status({ gatewayEnabled: false })).kind === 'due' && votingBillingView(status({ gatewayEnabled: false }))).toMatchObject({ canPayOnline: false });
  });

  it('avisa si hay un intento de pago sin confirmar', () => {
    const view = votingBillingView(status({ payments: [{ id: 1, reference: 'R', provider: 'wompi', days: 2, amountInCents: 10000000, currency: 'COP', status: 'PENDING', createdAt: '' }] }));
    expect(view).toMatchObject({ kind: 'due', pendingAttempt: true });
  });

  it('pagado muestra los días cubiertos', () => {
    expect(votingBillingView(status({ paid: true, paidDays: 2, dueDays: 0, amountDueInCents: 0 }))).toEqual({ kind: 'paid', days: 2 });
  });
});
