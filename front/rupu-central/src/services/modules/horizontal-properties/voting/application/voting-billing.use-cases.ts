/**
 * Use Cases: cobro por día de votación
 */

import type { VotingBillingStatus, VotingGroupPayment } from '../domain/entities';
import type { IVotingBillingRepository, VotingBillingScope, VotingCheckout } from '../domain/ports/voting-billing.repository';

function assertScope(scope: VotingBillingScope) {
  if (!scope.groupId || scope.groupId <= 0) throw new Error('ID del grupo de votación inválido');
  if (!scope.businessId || scope.businessId <= 0) throw new Error('ID de la propiedad inválido');
}

export class GetVotingBillingStatusUseCase {
  constructor(private repository: IVotingBillingRepository) {}

  execute(scope: VotingBillingScope): Promise<VotingBillingStatus> {
    assertScope(scope);
    return this.repository.getStatus(scope);
  }
}

export class CreateVotingCheckoutUseCase {
  constructor(private repository: IVotingBillingRepository) {}

  execute(input: VotingBillingScope & { redirectUrl: string }): Promise<VotingCheckout> {
    assertScope(input);
    if (!/^https?:\/\//.test(input.redirectUrl)) throw new Error('URL de retorno inválida');
    return this.repository.createCheckout(input);
  }
}

export class SyncVotingPaymentUseCase {
  constructor(private repository: IVotingBillingRepository) {}

  execute(input: VotingBillingScope & { transactionId: string }): Promise<VotingBillingStatus> {
    assertScope(input);
    if (!input.transactionId) throw new Error('Transacción inválida');
    return this.repository.syncTransaction(input);
  }
}

export class RegisterManualVotingPaymentUseCase {
  constructor(private repository: IVotingBillingRepository) {}

  execute(input: VotingBillingScope & { notes?: string }): Promise<VotingGroupPayment> {
    assertScope(input);
    return this.repository.registerManualPayment(input);
  }
}

export class SetVotingBillingExemptionUseCase {
  constructor(private repository: IVotingBillingRepository) {}

  execute(input: { token: string; businessId: number; exempt: boolean }): Promise<void> {
    if (!input.businessId || input.businessId <= 0) throw new Error('ID de la propiedad inválido');
    return this.repository.setExemption(input);
  }
}
