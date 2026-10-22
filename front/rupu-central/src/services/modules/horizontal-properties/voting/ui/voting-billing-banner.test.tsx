import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = vi.hoisted(() => ({
  getVotingBillingStatusAction: vi.fn(),
  createVotingCheckoutAction: vi.fn(),
  syncVotingPaymentAction: vi.fn(),
  registerManualVotingPaymentAction: vi.fn(),
  setVotingBillingExemptionAction: vi.fn(),
}));
vi.mock('../infrastructure/actions', () => actions);
const perms = vi.hoisted(() => ({ isSuperAdmin: false }));
vi.mock('@/services/auth/permissions/ui/hooks/use-permissions', () => ({
  usePermissions: () => ({ permissions: { isSuperAdmin: perms.isSuperAdmin, resources: [] } }),
}));
vi.mock('@shared/config', () => ({ TokenStorage: { getBusinessToken: () => 'T', getUserPermissions: () => null } }));
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import { VotingBillingBanner } from './voting-billing-banner';
import type { VotingBillingStatus } from '../domain/entities';

const due: VotingBillingStatus = {
  votingGroupId: 42,
  requiredDays: 1,
  paidDays: 0,
  dueDays: 1,
  pricePerDayCop: 50000,
  amountDueInCents: 5000000,
  exempt: false,
  paid: false,
  gatewayEnabled: true,
  payments: [],
};

describe('VotingBillingBanner', () => {
  beforeEach(() => {
    Object.values(actions).forEach((a) => a.mockReset());
    perms.isSuperAdmin = false;
    window.history.replaceState(null, '', '/properties/1/voting-groups');
  });

  it('con el día pendiente muestra el monto y lleva a Wompi con la URL de retorno del grupo', async () => {
    actions.getVotingBillingStatusAction.mockResolvedValue({ success: true, data: due });
    actions.createVotingCheckoutAction.mockResolvedValue({ success: true, data: { checkoutUrl: 'https://checkout.wompi.co/p/?x=1' } });
    const assign = vi.fn();
    Object.defineProperty(window, 'location', { value: { ...window.location, assign, origin: 'http://localhost:3005', pathname: '/properties/1/voting-groups', search: '' }, writable: true });

    render(<VotingBillingBanner businessId={1} groupId={42} />);
    expect(await screen.findByText(/Pago pendiente: 1 día de votación · \$50\.000/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Pagar $50.000 con Wompi' }));

    await waitFor(() => expect(assign).toHaveBeenCalledWith('https://checkout.wompi.co/p/?x=1'));
    expect(actions.createVotingCheckoutAction).toHaveBeenCalledWith(
      expect.objectContaining({ businessId: 1, groupId: 42, redirectUrl: 'http://localhost:3005/properties/1/voting-groups?payment_group=42' }),
    );
    expect(screen.queryByRole('button', { name: 'Registrar pago manual' })).not.toBeInTheDocument();
  });

  it('una propiedad exenta no ve ningún cobro', async () => {
    actions.getVotingBillingStatusAction.mockResolvedValue({ success: true, data: { ...due, exempt: true, paid: true, dueDays: 0, amountDueInCents: 0 } });
    const { container } = render(<VotingBillingBanner businessId={1} groupId={42} />);
    await waitFor(() => expect(actions.getVotingBillingStatusAction).toHaveBeenCalled());
    expect(screen.queryByText(/Pago pendiente/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(container.textContent).toBe('');
  });

  it('el super admin puede registrar un pago manual', async () => {
    perms.isSuperAdmin = true;
    actions.getVotingBillingStatusAction.mockResolvedValue({ success: true, data: due });
    actions.registerManualVotingPaymentAction.mockResolvedValue({ success: true, data: { days: 1 } });

    render(<VotingBillingBanner businessId={1} groupId={42} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Registrar pago manual' }));

    await waitFor(() => expect(actions.registerManualVotingPaymentAction).toHaveBeenCalledWith(expect.objectContaining({ businessId: 1, groupId: 42 })));
    expect(await screen.findByText('Pago manual registrado.')).toBeInTheDocument();
  });
});
