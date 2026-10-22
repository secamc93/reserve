/**
 * Repositorio HTTP del cobro por día de votación.
 */

import { env, logHttpRequest, logHttpSuccess, logHttpError } from '@shared/config';
import type { VotingBillingStatus, VotingGroupPayment } from '../../domain';
import type { IVotingBillingRepository, VotingBillingScope, VotingCheckout } from '../../domain/ports';

interface BackendPayment {
  id: number;
  reference: string;
  provider: 'wompi' | 'manual';
  days: number;
  amount_in_cents: number;
  currency: string;
  status: VotingGroupPayment['status'];
  payment_method_type?: string;
  paid_at?: string;
  created_at: string;
}

interface BackendStatus {
  voting_group_id: number;
  required_days: number;
  paid_days: number;
  due_days: number;
  price_per_day_cop: number;
  amount_due_in_cents: number;
  exempt: boolean;
  paid: boolean;
  gateway_enabled: boolean;
  payments: BackendPayment[] | null;
}

interface BackendEnvelope<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}

function toPayment(p: BackendPayment): VotingGroupPayment {
  return {
    id: p.id,
    reference: p.reference,
    provider: p.provider,
    days: p.days,
    amountInCents: p.amount_in_cents,
    currency: p.currency,
    status: p.status,
    paymentMethodType: p.payment_method_type,
    paidAt: p.paid_at,
    createdAt: p.created_at,
  };
}

function toStatus(s: BackendStatus): VotingBillingStatus {
  return {
    votingGroupId: s.voting_group_id,
    requiredDays: s.required_days,
    paidDays: s.paid_days,
    dueDays: s.due_days,
    pricePerDayCop: s.price_per_day_cop,
    amountDueInCents: s.amount_due_in_cents,
    exempt: s.exempt,
    paid: s.paid,
    gatewayEnabled: s.gateway_enabled,
    payments: (s.payments ?? []).map(toPayment),
  };
}

export class VotingBillingRepository implements IVotingBillingRepository {
  private groupUrl(p: VotingBillingScope, path: string): string {
    return `${env.API_BASE_URL}/horizontal-properties/voting-groups/${p.groupId}${path}?business_id=${p.businessId}`;
  }

  private async request<T>(method: 'GET' | 'POST' | 'PUT', url: string, token: string, body?: unknown): Promise<T> {
    const startTime = Date.now();
    logHttpRequest({ method, url });
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
    const duration = Date.now() - startTime;
    const data: BackendEnvelope<T> = await response.json().catch(() => ({ success: false }));
    if (!response.ok || !data.success) {
      logHttpError({ status: response.status, statusText: response.statusText, duration, data });
      throw new Error(data.message || `Error ${response.status}`);
    }
    logHttpSuccess({ status: response.status, statusText: response.statusText, duration });
    return data.data as T;
  }

  async getStatus(p: VotingBillingScope): Promise<VotingBillingStatus> {
    return toStatus(await this.request<BackendStatus>('GET', this.groupUrl(p, '/payment'), p.token));
  }

  async createCheckout(p: VotingBillingScope & { redirectUrl: string }): Promise<VotingCheckout> {
    const data = await this.request<{ payment: BackendPayment; checkout_url: string }>(
      'POST', this.groupUrl(p, '/payments/checkout'), p.token, { redirect_url: p.redirectUrl },
    );
    return { payment: toPayment(data.payment), checkoutUrl: data.checkout_url };
  }

  async syncTransaction(p: VotingBillingScope & { transactionId: string }): Promise<VotingBillingStatus> {
    return toStatus(await this.request<BackendStatus>('POST', this.groupUrl(p, '/payments/sync'), p.token, { transaction_id: p.transactionId }));
  }

  async registerManualPayment(p: VotingBillingScope & { notes?: string }): Promise<VotingGroupPayment> {
    return toPayment(await this.request<BackendPayment>('POST', this.groupUrl(p, '/payments/manual'), p.token, { notes: p.notes ?? '' }));
  }

  async setExemption(p: { token: string; businessId: number; exempt: boolean }): Promise<void> {
    await this.request<unknown>('PUT', `${env.API_BASE_URL}/horizontal-properties/voting-billing/exemption?business_id=${p.businessId}`, p.token, { exempt: p.exempt });
  }
}
