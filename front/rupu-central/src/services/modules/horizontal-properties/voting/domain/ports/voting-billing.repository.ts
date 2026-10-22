/**
 * Puerto del cobro por día de votación.
 */

import type { VotingBillingStatus, VotingGroupPayment } from '../entities';

export interface VotingBillingScope {
  token: string;
  businessId: number;
  groupId: number;
}

export interface VotingCheckout {
  payment: VotingGroupPayment;
  checkoutUrl: string;
}

export interface IVotingBillingRepository {
  getStatus(params: VotingBillingScope): Promise<VotingBillingStatus>;
  createCheckout(params: VotingBillingScope & { redirectUrl: string }): Promise<VotingCheckout>;
  syncTransaction(params: VotingBillingScope & { transactionId: string }): Promise<VotingBillingStatus>;
  registerManualPayment(params: VotingBillingScope & { notes?: string }): Promise<VotingGroupPayment>;
  setExemption(params: { token: string; businessId: number; exempt: boolean }): Promise<void>;
}
