/**
 * Server Actions: cobro de votaciones (días comprados, exenciones) y membresías.
 */

'use server';

import { MembershipUseCases, VotingBillingUseCases } from '../../application';
import type { DayPurchase, Membership, MembershipPlan, PropertyAdmin, VotingCoverage } from '../../domain';
import { MembershipRepository, VotingBillingRepository } from '../repositories';

export interface BillingResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function run<T>(name: string, fn: () => Promise<T>): Promise<BillingResult<T>> {
  try {
    return { success: true, data: await fn() };
  } catch (error) {
    console.error(`❌ Error en ${name}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

const billing = () => new VotingBillingUseCases(new VotingBillingRepository());
const memberships = () => new MembershipUseCases(new MembershipRepository());

type Scope = { token: string; businessId: number };

export async function getVotingCoverageAction(p: Scope): Promise<BillingResult<VotingCoverage>> {
  return run('getVotingCoverageAction', () => billing().getCoverage(p));
}

export async function createDaysCheckoutAction(p: Scope & { dates: string[]; redirectUrl: string }): Promise<BillingResult<{ checkoutUrl: string }>> {
  return run('createDaysCheckoutAction', () => billing().createDaysCheckout(p));
}

export async function syncDaysAction(p: Scope & { transactionId: string }): Promise<BillingResult<VotingCoverage>> {
  return run('syncDaysAction', () => billing().syncDays(p));
}

export async function grantDaysAction(p: Scope & { dates: string[]; source: 'manual' | 'cortesia'; notes?: string }): Promise<BillingResult<DayPurchase>> {
  return run('grantDaysAction', () => billing().grantDays(p));
}

export async function setPropertyExemptionAction(p: Scope & { exempt: boolean }): Promise<BillingResult<null>> {
  return run('setPropertyExemptionAction', async () => { await billing().setPropertyExemption(p); return null; });
}

export async function listPropertyAdminsAction(p: Scope): Promise<BillingResult<PropertyAdmin[]>> {
  return run('listPropertyAdminsAction', () => billing().listAdmins(p));
}

export async function setAdminExemptionAction(p: { token: string; userId: number; exempt: boolean; notes?: string }): Promise<BillingResult<null>> {
  return run('setAdminExemptionAction', async () => { await billing().setAdminExemption(p); return null; });
}

export async function listMembershipPlansAction(p: { token: string }): Promise<BillingResult<MembershipPlan[]>> {
  return run('listMembershipPlansAction', () => memberships().listPlans(p));
}

export async function listPropertyMembershipsAction(p: Scope): Promise<BillingResult<Membership[]>> {
  return run('listPropertyMembershipsAction', () => memberships().listForBusiness(p));
}

export async function createMembershipCheckoutAction(p: { token: string; planCode: string; businessIds: number[]; redirectUrl: string }): Promise<BillingResult<{ checkoutUrl: string }>> {
  return run('createMembershipCheckoutAction', () => memberships().createCheckout(p));
}

export async function syncMembershipAction(p: { token: string; transactionId: string }): Promise<BillingResult<Membership>> {
  return run('syncMembershipAction', () => memberships().sync(p));
}

export async function grantMembershipAction(p: { token: string; planCode: string; maxProperties?: number; businessIds: number[]; source: 'manual' | 'cortesia'; notes?: string }): Promise<BillingResult<Membership>> {
  return run('grantMembershipAction', () => memberships().grant(p));
}
