/**
 * Cobro por día de votación: estado de pago de un grupo (asamblea).
 */

export type VotingPaymentStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';

export interface VotingGroupPayment {
  id: number;
  reference: string;
  provider: 'wompi' | 'manual';
  days: number;
  amountInCents: number;
  currency: string;
  status: VotingPaymentStatus;
  paymentMethodType?: string;
  paidAt?: string;
  createdAt: string;
}

export interface VotingBillingStatus {
  votingGroupId: number;
  requiredDays: number;
  paidDays: number;
  dueDays: number;
  pricePerDayCop: number;
  amountDueInCents: number;
  exempt: boolean;
  paid: boolean;
  gatewayEnabled: boolean;
  payments: VotingGroupPayment[];
}

/** Pesos colombianos sin decimales: 5000000 centavos → "$50.000". */
export function formatCopFromCents(cents: number): string {
  return '$' + Math.round(cents / 100).toLocaleString('es-CO');
}

/** Qué mostrar en el aviso de cobro del grupo. */
export type VotingBillingView =
  | { kind: 'hidden' }
  | { kind: 'paid'; days: number }
  | { kind: 'due'; days: number; amount: string; canPayOnline: boolean; pendingAttempt: boolean };

export function votingBillingView(status: VotingBillingStatus): VotingBillingView {
  if (status.exempt) return { kind: 'hidden' };
  if (status.paid) return { kind: 'paid', days: status.paidDays };
  return {
    kind: 'due',
    days: status.dueDays,
    amount: formatCopFromCents(status.amountDueInCents),
    canPayOnline: status.gatewayEnabled,
    pendingAttempt: status.payments.some((p) => p.status === 'PENDING'),
  };
}
