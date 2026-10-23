/**
 * Repositorios HTTP del cobro de votaciones (días comprados) y de membresías.
 */

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import type { DayPurchase, Membership, MembershipPlan, PropertyAdmin, VotingCoverage } from '../../domain';
import type { BillingScope, IMembershipRepository, IVotingBillingRepository } from '../../domain/ports';

interface Envelope<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

async function request<T>(method: 'GET' | 'POST' | 'PUT', url: string, token: string, body?: unknown): Promise<T> {
  const startTime = Date.now();
  logHttpRequest({ method, url });
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: 'no-store',
  });
  const duration = Date.now() - startTime;
  const data: Envelope<T> = await response.json().catch(() => ({ success: false }));
  if (!response.ok || !data.success) {
    logHttpError({ status: response.status, statusText: response.statusText, duration, data });
    throw new Error(data.message || `Error ${response.status}`);
  }
  logHttpSuccess({ status: response.status, statusText: response.statusText, duration });
  return data.data as T;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const toPurchase = (p: any): DayPurchase => ({
  id: p.id, reference: p.reference, source: p.source, dates: p.dates ?? [], amountInCents: p.amount_in_cents,
  status: p.status, paymentMethodType: p.payment_method_type, createdAt: p.created_at,
});

const toCoverage = (c: any): VotingCoverage => ({
  businessId: c.business_id,
  today: c.today,
  todayCovered: c.today_covered,
  propertyExempt: c.property_exempt,
  adminExempt: c.admin_exempt,
  membership: c.membership ? { planCode: c.membership.plan_code, endsAt: c.membership.ends_at } : null,
  purchasedDates: c.purchased_dates ?? [],
  assemblies: (c.assemblies ?? []).map((a: any) => ({ groupId: a.group_id, name: a.name, dates: a.dates ?? [], uncoveredDates: a.uncovered_dates ?? [] })),
  pricePerDayCop: c.price_per_day_cop,
  gatewayEnabled: c.gateway_enabled,
  recentPurchases: (c.recent_purchases ?? []).map(toPurchase),
});

const toMembership = (m: any): Membership => ({
  id: m.id, planCode: m.plan_code, maxProperties: m.max_properties, status: m.status, source: m.source,
  startsAt: m.starts_at, endsAt: m.ends_at, businessIds: m.business_ids ?? [],
});
/* eslint-enable @typescript-eslint/no-explicit-any */

const billing = (path: string, businessId?: number) =>
  `${env.API_BASE_URL}/horizontal-properties/voting-billing${path}${businessId ? `?business_id=${businessId}` : ''}`;
const memberships = (path: string, businessId?: number) =>
  `${env.API_BASE_URL}/horizontal-properties/memberships${path}${businessId ? `?business_id=${businessId}` : ''}`;

export class VotingBillingRepository implements IVotingBillingRepository {
  async getCoverage(p: BillingScope) {
    return toCoverage(await request('GET', billing('/coverage', p.businessId), p.token));
  }
  async createDaysCheckout(p: BillingScope & { dates: string[]; redirectUrl: string }) {
    const d = await request<{ checkout_url: string }>('POST', billing('/days/checkout', p.businessId), p.token, { dates: p.dates, redirect_url: p.redirectUrl });
    return { checkoutUrl: d.checkout_url };
  }
  async syncDays(p: BillingScope & { transactionId: string }) {
    return toCoverage(await request('POST', billing('/days/sync', p.businessId), p.token, { transaction_id: p.transactionId }));
  }
  async grantDays(p: BillingScope & { dates: string[]; source: 'manual' | 'cortesia'; notes?: string }) {
    return toPurchase(await request('POST', billing('/days/grant', p.businessId), p.token, { dates: p.dates, source: p.source, notes: p.notes ?? '' }));
  }
  async setPropertyExemption(p: BillingScope & { exempt: boolean }) {
    await request('PUT', billing('/exemption', p.businessId), p.token, { exempt: p.exempt });
  }
  async listAdmins(p: BillingScope): Promise<PropertyAdmin[]> {
    const rows = await request<{ user_id: number; name: string; email: string; exempt: boolean }[]>('GET', billing('/admins', p.businessId), p.token);
    return rows.map((r) => ({ userId: r.user_id, name: r.name, email: r.email, exempt: r.exempt }));
  }
  async setAdminExemption(p: { token: string; userId: number; exempt: boolean; notes?: string }) {
    await request('PUT', billing('/admin-exemption'), p.token, { user_id: p.userId, exempt: p.exempt, notes: p.notes ?? '' });
  }
}

export class MembershipRepository implements IMembershipRepository {
  async listPlans(p: { token: string }): Promise<MembershipPlan[]> {
    const rows = await request<{ code: string; name: string; max_properties: number; price_cop: number; duration_days: number }[]>('GET', memberships('/plans'), p.token);
    return rows.map((r) => ({ code: r.code, name: r.name, maxProperties: r.max_properties, priceCop: r.price_cop, durationDays: r.duration_days }));
  }
  async listForBusiness(p: BillingScope) {
    return (await request<unknown[]>('GET', memberships('', p.businessId), p.token)).map(toMembership);
  }
  async createCheckout(p: { token: string; planCode: string; businessIds: number[]; redirectUrl: string }) {
    const d = await request<{ checkout_url: string }>('POST', memberships('/checkout'), p.token, { plan_code: p.planCode, business_ids: p.businessIds, redirect_url: p.redirectUrl });
    return { checkoutUrl: d.checkout_url };
  }
  async sync(p: { token: string; transactionId: string }) {
    return toMembership(await request('POST', memberships('/sync'), p.token, { transaction_id: p.transactionId }));
  }
  async grant(p: { token: string; planCode: string; maxProperties?: number; businessIds: number[]; source: 'manual' | 'cortesia'; notes?: string }) {
    return toMembership(await request('POST', memberships('/grant'), p.token, {
      plan_code: p.planCode, max_properties: p.maxProperties ?? 0, business_ids: p.businessIds, source: p.source, notes: p.notes ?? '',
    }));
  }
}
