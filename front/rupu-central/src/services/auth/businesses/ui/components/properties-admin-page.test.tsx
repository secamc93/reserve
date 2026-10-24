import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = vi.hoisted(() => ({
  getBusinessesAction: vi.fn(),
  getBusinessConfiguredResourcesAction: vi.fn(),
  activateResourceAction: vi.fn(),
  deactivateResourceAction: vi.fn(),
}));
vi.mock('../../infrastructure/actions', () => actions);
const users = vi.hoisted(() => ({ getUsersAction: vi.fn() }));
vi.mock('@/services/auth/users/infrastructure/actions', () => users);
vi.mock('../../../business-types/ui/hooks', () => ({ useBusinessTypes: () => ({ allBusinessTypes: [] }) }));
vi.mock('@shared/config', () => ({ TokenStorage: { getBusinessToken: () => 'T' } }));
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/iam/businesses',
  useSearchParams: () => new URLSearchParams(),
}));

import { PropertiesAdminPage } from './properties-admin-page';

describe('Propiedades — tarjetas y módulos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.getBusinessesAction.mockResolvedValue({
      success: true,
      data: {
        businesses: [{ id: 7, name: 'Tayazal de Suba', address: 'Calle 100', is_active: true, business_type_id: 1, business_type: 'Propiedad Horizontal' }],
        pagination: { total: 1, last_page: 1 },
      },
    });
    users.getUsersAction.mockResolvedValue({ success: true, data: { count: 4, users: [] } });
    actions.getBusinessConfiguredResourcesAction.mockResolvedValue({
      success: true,
      data: { resources: [{ resource_id: 3, resource_name: 'Visitas', is_active: true }, { resource_id: 1, resource_name: 'Asistencia', is_active: false }] },
    });
    actions.activateResourceAction.mockResolvedValue({ success: true });
    actions.deactivateResourceAction.mockResolvedValue({ success: true });
  });

  it('muestra la propiedad con su estado y cuántos usuarios tiene', async () => {
    render(<PropertiesAdminPage />);
    expect(await screen.findByRole('heading', { name: 'Tayazal de Suba' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: '4 usuarios' })).toHaveAttribute('href', '/iam/users?propiedad=7');
    expect(users.getUsersAction).toHaveBeenCalledWith({ token: 'T', business_id: 7, page: 1, page_size: 1 });
  });

  it('enciende y apaga módulos de la propiedad', async () => {
    const u = userEvent.setup();
    render(<PropertiesAdminPage />);
    await u.click(await screen.findByRole('button', { name: 'Módulos de Tayazal de Suba' }));
    const panel = screen.getByRole('dialog', { name: 'Tayazal de Suba' });
    await waitFor(() => expect(within(panel).getByRole('region', { name: 'Módulos' })).toHaveTextContent('1 de 2 activos'));

    await u.click(within(panel).getByRole('switch', { name: 'Asistencia en Tayazal de Suba' }));
    await waitFor(() => expect(actions.activateResourceAction).toHaveBeenCalledWith({ token: 'T', resourceId: 1, businessId: 7 }));
    expect(within(panel).getByRole('switch', { name: 'Asistencia en Tayazal de Suba' })).toHaveAttribute('aria-checked', 'true');

    await u.click(within(panel).getByRole('switch', { name: 'Visitas en Tayazal de Suba' }));
    await waitFor(() => expect(actions.deactivateResourceAction).toHaveBeenCalledWith({ token: 'T', resourceId: 3, businessId: 7 }));
  });

  it('si el back rechaza el cambio, lo avisa y no cambia el interruptor', async () => {
    actions.deactivateResourceAction.mockResolvedValue({ success: false, error: 'Sin permiso' });
    const u = userEvent.setup();
    render(<PropertiesAdminPage />);
    await u.click(await screen.findByRole('button', { name: 'Módulos de Tayazal de Suba' }));
    const panel = screen.getByRole('dialog', { name: 'Tayazal de Suba' });
    const visitas = await within(panel).findByRole('switch', { name: 'Visitas en Tayazal de Suba' });
    await u.click(visitas);
    expect(await within(panel).findByRole('alert')).toHaveTextContent('Sin permiso');
    expect(visitas).toHaveAttribute('aria-checked', 'true');
  });
});
