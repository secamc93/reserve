/**
 * Server Actions: cobro por día de votación (Wompi)
 */

'use server';

import {
  CreateVotingCheckoutUseCase,
  GetVotingBillingStatusUseCase,
  RegisterManualVotingPaymentUseCase,
  SetVotingBillingExemptionUseCase,
  SyncVotingPaymentUseCase,
} from '../../application';
import type { VotingBillingStatus } from '../../domain';
import { VotingBillingRepository } from '../repositories';

export interface VotingBillingInput {
  token: string;
  businessId: number;
  groupId: number;
}

export interface VotingBillingResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function run<T>(name: string, fn: () => Promise<T>): Promise<VotingBillingResult<T>> {
  try {
    return { success: true, data: await fn() };
  } catch (error) {
    console.error(`❌ Error en ${name}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function getVotingBillingStatusAction(input: VotingBillingInput): Promise<VotingBillingResult<VotingBillingStatus>> {
  return run('getVotingBillingStatusAction', () => new GetVotingBillingStatusUseCase(new VotingBillingRepository()).execute(input));
}

export async function createVotingCheckoutAction(input: VotingBillingInput & { redirectUrl: string }): Promise<VotingBillingResult<{ checkoutUrl: string }>> {
  return run('createVotingCheckoutAction', async () => {
    const checkout = await new CreateVotingCheckoutUseCase(new VotingBillingRepository()).execute(input);
    return { checkoutUrl: checkout.checkoutUrl };
  });
}

export async function syncVotingPaymentAction(input: VotingBillingInput & { transactionId: string }): Promise<VotingBillingResult<VotingBillingStatus>> {
  return run('syncVotingPaymentAction', () => new SyncVotingPaymentUseCase(new VotingBillingRepository()).execute(input));
}

export async function registerManualVotingPaymentAction(input: VotingBillingInput & { notes?: string }): Promise<VotingBillingResult<{ days: number }>> {
  return run('registerManualVotingPaymentAction', async () => {
    const payment = await new RegisterManualVotingPaymentUseCase(new VotingBillingRepository()).execute(input);
    return { days: payment.days };
  });
}

export async function setVotingBillingExemptionAction(input: { token: string; businessId: number; exempt: boolean }): Promise<VotingBillingResult<null>> {
  return run('setVotingBillingExemptionAction', async () => {
    await new SetVotingBillingExemptionUseCase(new VotingBillingRepository()).execute(input);
    return null;
  });
}
