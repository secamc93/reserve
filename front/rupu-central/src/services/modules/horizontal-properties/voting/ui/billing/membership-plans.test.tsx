import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = vi.hoisted(() => ({
  listMembershipPlansAction: vi.fn(),
  createMembershipCheckoutAction: vi.fn(),
  grantMembershipAction: vi.fn(),
}));
vi.mock('../../infrastructure/actions', () => actions);
vi.mock('@/services/auth/permissions/ui/hooks/use-permissions', () => ({ usePermissions: () => ({ permissions: { isSuperAdmin: false, resources: [] } }) }));
vi.mock('@shared/config', () => ({ TokenStorage: { getBusinessToken: () => 'T', getUserPermissions: () => null } }));
vi.mock('@/shared/ui/use-accessible-properties', () => ({
  useAccessibleProperties: () => ({ loading: false, error: null, properties: [1, 2, 3, 4].map((id) => ({ id, name: `Conjunto ${id}` })) }),
}));
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import { MembershipPlans, limitSelection } from './membership-plans';

const plans = [
  { code: 'MONTH_1', name: 'Mes · 1 conjunto', maxProperties: 1, priceCop: 200000, durationDays: 30 },
  { code: 'ADMIN_3', name: 'Administradora · hasta 3 conjuntos', maxProperties: 3, priceCop: 300000, durationDays: 30 },
];

describe('limitSelection', () => {
  it('conserva los primeros conjuntos hasta el tope', () => {
    expect(limitSelection([4, 2, 9], 2)).toEqual([4, 2]);
  });
});

describe('MembershipPlans', () => {
  beforeEach(() => {
    Object.values(actions).forEach((a) => a.mockReset());
    actions.listMembershipPlansAction.mockResolvedValue({ success: true, data: plans });
  });

  it('el plan de administradora deja marcar hasta 3 conjuntos y paga con esos', async () => {
    actions.createMembershipCheckoutAction.mockResolvedValue({ success: true, data: { checkoutUrl: 'https://checkout.wompi.co/p/?a' } });
    const assign = vi.fn();
    Object.defineProperty(window, 'location', { value: { ...window.location, assign, origin: 'http://rupu.localhost:3005' }, writable: true });

    render(<MembershipPlans businessId={1} />);
    await userEvent.click(await screen.findByRole('radio', { name: /hasta 3 conjuntos/ }));
    await userEvent.click(screen.getByLabelText('Conjunto 2'));
    await userEvent.click(screen.getByLabelText('Conjunto 3'));
    expect(screen.getByLabelText('Conjunto 4')).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'Pagar $300.000 con Wompi' }));
    await waitFor(() => expect(actions.createMembershipCheckoutAction).toHaveBeenCalledWith(expect.objectContaining({
      planCode: 'ADMIN_3', businessIds: [1, 2, 3], redirectUrl: 'http://rupu.localhost:3005/properties/1/voting-groups?pago=membresia',
    })));
    expect(assign).toHaveBeenCalledWith('https://checkout.wompi.co/p/?a');
  });
});
