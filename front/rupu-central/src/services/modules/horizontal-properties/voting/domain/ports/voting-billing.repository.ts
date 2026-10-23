/**
 * Puertos del cobro de votaciones: días comprados, exenciones y membresías.
 */

import type { DayPurchase, Membership, MembershipPlan, PropertyAdmin, VotingCoverage } from '../entities';

export interface BillingScope {
  token: string;
  businessId: number;
}

export interface IVotingBillingRepository {
  getCoverage(p: BillingScope): Promise<VotingCoverage>;
  createDaysCheckout(p: BillingScope & { dates: string[]; redirectUrl: string }): Promise<{ checkoutUrl: string }>;
  syncDays(p: BillingScope & { transactionId: string }): Promise<VotingCoverage>;
  grantDays(p: BillingScope & { dates: string[]; source: 'manual' | 'cortesia'; notes?: string }): Promise<DayPurchase>;
  setPropertyExemption(p: BillingScope & { exempt: boolean }): Promise<void>;
  listAdmins(p: BillingScope): Promise<PropertyAdmin[]>;
  setAdminExemption(p: { token: string; userId: number; exempt: boolean; notes?: string }): Promise<void>;
}

export interface IMembershipRepository {
  listPlans(p: { token: string }): Promise<MembershipPlan[]>;
  listForBusiness(p: BillingScope): Promise<Membership[]>;
  createCheckout(p: { token: string; planCode: string; businessIds: number[]; redirectUrl: string }): Promise<{ checkoutUrl: string }>;
  sync(p: { token: string; transactionId: string }): Promise<Membership>;
  grant(p: { token: string; planCode: string; maxProperties?: number; businessIds: number[]; source: 'manual' | 'cortesia'; notes?: string }): Promise<Membership>;
}
