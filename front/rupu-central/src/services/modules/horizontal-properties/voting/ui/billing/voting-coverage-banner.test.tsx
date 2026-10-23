import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = vi.hoisted(() => ({
  getVotingCoverageAction: vi.fn(),
  listMembershipPlansAction: vi.fn(),
  createDaysCheckoutAction: vi.fn(),
  createMembershipCheckoutAction: vi.fn(),
  syncDaysAction: vi.fn(),
  syncMembershipAction: vi.fn(),
  grantDaysAction: vi.fn(),
  grantMembershipAction: vi.fn(),
  setPropertyExemptionAction: vi.fn(),
  listPropertyAdminsAction: vi.fn(),
  setAdminExemptionAction: vi.fn(),
}));
vi.mock('../../infrastructure/actions', () => actions);
const perms = vi.hoisted(() => ({ isSuperAdmin: false }));
vi.mock('@/services/auth/permissions/ui/hooks/use-permissions', () => ({
  usePermissions: () => ({ permissions: { isSuperAdmin: perms.isSuperAdmin, resources: [] } }),
}));
vi.mock('@shared/config', () => ({ TokenStorage: { getBusinessToken: () => 'T', getUserPermissions: () => null } }));
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import { VotingCoverageBanner } from './voting-coverage-banner';
import type { VotingCoverage } from '../../domain/entities';

const coverage = (over: Partial<VotingCoverage> = {}): VotingCoverage => ({
  businessId: 1, today: '2026-10-22', todayCovered: false, propertyExempt: false, adminExempt: false, membership: null,
  purchasedDates: [], assemblies: [{ groupId: 3, name: 'Ordinaria', dates: ['2026-10-24', '2026-10-25'], uncoveredDates: ['2026-10-24', '2026-10-25'] }],
  pricePerDayCop: 50000, gatewayEnabled: true, recentPurchases: [], ...over,
});

const assign = vi.fn();

describe('VotingCoverageBanner', () => {
  beforeEach(() => {
    Object.values(actions).forEach((a) => a.mockReset());
    actions.listMembershipPlansAction.mockResolvedValue({ success: true, data: [{ code: 'MONTH_1', name: 'Mes', maxProperties: 1, priceCop: 200000, durationDays: 30 }] });
    perms.isSuperAdmin = false;
    assign.mockReset();
    Object.defineProperty(window, 'location', { value: { ...window.location, assign, origin: 'http://rupu.localhost:3005', pathname: '/properties/1/voting-groups', search: '' }, writable: true });
  });

  it('avisa los días que faltan y compra las fechas de la asamblea con Wompi', async () => {
    actions.getVotingCoverageAction.mockResolvedValue({ success: true, data: coverage() });
    actions.createDaysCheckoutAction.mockResolvedValue({ success: true, data: { checkoutUrl: 'https://checkout.wompi.co/p/?x' } });

    render(<VotingCoverageBanner businessId={1} />);
    expect(await screen.findByText(/necesitan 2 días de votación · \$100\.000/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Comprar días' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Pagar $100.000 con Wompi' }));

    await waitFor(() => expect(assign).toHaveBeenCalledWith('https://checkout.wompi.co/p/?x'));
    expect(actions.createDaysCheckoutAction).toHaveBeenCalledWith(expect.objectContaining({
      businessId: 1, dates: ['2026-10-24', '2026-10-25'], redirectUrl: 'http://rupu.localhost:3005/properties/1/voting-groups?pago=dias',
    }));
  });

  it('el mes ilimitado usa el precio del catálogo y compra el plan de un conjunto', async () => {
    actions.getVotingCoverageAction.mockResolvedValue({ success: true, data: coverage() });
    actions.createMembershipCheckoutAction.mockResolvedValue({ success: true, data: { checkoutUrl: 'https://checkout.wompi.co/p/?m' } });

    render(<VotingCoverageBanner businessId={1} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Mes ilimitado $200.000' }));
    await waitFor(() => expect(actions.createMembershipCheckoutAction).toHaveBeenCalledWith(expect.objectContaining({ planCode: 'MONTH_1', businessIds: [1] })));
  });

  it('una propiedad exenta no le muestra cobro al administrador', async () => {
    actions.getVotingCoverageAction.mockResolvedValue({ success: true, data: coverage({ adminExempt: true }) });
    render(<VotingCoverageBanner businessId={1} />);
    await waitFor(() => expect(actions.getVotingCoverageAction).toHaveBeenCalled());
    expect(screen.queryByText(/necesitan/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Comprar días' })).not.toBeInTheDocument();
  });

  it('al volver de Wompi confirma la compra de días', async () => {
    window.location.search = '?pago=dias&id=tx-9';
    actions.syncDaysAction.mockResolvedValue({ success: true, data: coverage({ assemblies: [] }) });
    actions.getVotingCoverageAction.mockResolvedValue({ success: true, data: coverage({ assemblies: [], todayCovered: true }) });
    const replace = vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});

    render(<VotingCoverageBanner businessId={1} />);
    expect(await screen.findByText('¡Pago recibido! Tus días de votación quedaron listos.')).toBeInTheDocument();
    expect(actions.syncDaysAction).toHaveBeenCalledWith(expect.objectContaining({ businessId: 1, transactionId: 'tx-9' }));
    expect(replace).toHaveBeenCalled();
  });

  it('el super admin otorga días de cortesía', async () => {
    perms.isSuperAdmin = true;
    actions.getVotingCoverageAction.mockResolvedValue({ success: true, data: coverage() });
    actions.grantDaysAction.mockResolvedValue({ success: true, data: {} });

    render(<VotingCoverageBanner businessId={1} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Otorgar días' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Otorgar 2 días' }));
    await waitFor(() => expect(actions.grantDaysAction).toHaveBeenCalledWith(expect.objectContaining({ dates: ['2026-10-24', '2026-10-25'], source: 'cortesia' })));
    expect(await screen.findByText('Días otorgados.')).toBeInTheDocument();
  });
});
