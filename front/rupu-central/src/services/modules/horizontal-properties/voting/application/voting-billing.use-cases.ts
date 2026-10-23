/**
 * Use Cases: cobro de votaciones (días comprados, exenciones) y membresías.
 */

import type { BillingScope, IMembershipRepository, IVotingBillingRepository } from '../domain/ports/voting-billing.repository';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function assertScope(p: BillingScope) {
  if (!p.businessId || p.businessId <= 0) throw new Error('ID de la propiedad inválido');
}

function assertDates(dates: string[]) {
  if (dates.length === 0 || dates.length > 31 || dates.some((d) => !DATE.test(d))) {
    throw new Error('Elige entre 1 y 31 fechas válidas');
  }
}

function assertRedirect(url: string) {
  if (!/^https?:\/\//.test(url)) throw new Error('URL de retorno inválida');
}

export class VotingBillingUseCases {
  constructor(private repo: IVotingBillingRepository) {}

  getCoverage(p: BillingScope) {
    assertScope(p);
    return this.repo.getCoverage(p);
  }

  createDaysCheckout(p: BillingScope & { dates: string[]; redirectUrl: string }) {
    assertScope(p);
    assertDates(p.dates);
    assertRedirect(p.redirectUrl);
    return this.repo.createDaysCheckout(p);
  }

  syncDays(p: BillingScope & { transactionId: string }) {
    assertScope(p);
    if (!p.transactionId) throw new Error('Transacción inválida');
    return this.repo.syncDays(p);
  }

  grantDays(p: BillingScope & { dates: string[]; source: 'manual' | 'cortesia'; notes?: string }) {
    assertScope(p);
    assertDates(p.dates);
    return this.repo.grantDays(p);
  }

  setPropertyExemption(p: BillingScope & { exempt: boolean }) {
    assertScope(p);
    return this.repo.setPropertyExemption(p);
  }

  listAdmins(p: BillingScope) {
    assertScope(p);
    return this.repo.listAdmins(p);
  }

  setAdminExemption(p: { token: string; userId: number; exempt: boolean; notes?: string }) {
    if (!p.userId || p.userId <= 0) throw new Error('Usuario inválido');
    return this.repo.setAdminExemption(p);
  }
}

export class MembershipUseCases {
  constructor(private repo: IMembershipRepository) {}

  listPlans(p: { token: string }) {
    return this.repo.listPlans(p);
  }

  listForBusiness(p: BillingScope) {
    assertScope(p);
    return this.repo.listForBusiness(p);
  }

  createCheckout(p: { token: string; planCode: string; businessIds: number[]; redirectUrl: string }) {
    if (!p.planCode) throw new Error('Elige un plan');
    if (p.businessIds.length === 0) throw new Error('Elige al menos un conjunto');
    assertRedirect(p.redirectUrl);
    return this.repo.createCheckout(p);
  }

  sync(p: { token: string; transactionId: string }) {
    if (!p.transactionId) throw new Error('Transacción inválida');
    return this.repo.sync(p);
  }

  grant(p: { token: string; planCode: string; maxProperties?: number; businessIds: number[]; source: 'manual' | 'cortesia'; notes?: string }) {
    if (p.businessIds.length === 0) throw new Error('Elige al menos un conjunto');
    return this.repo.grant(p);
  }
}
