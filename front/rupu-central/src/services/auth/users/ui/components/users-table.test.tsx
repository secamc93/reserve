import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = vi.hoisted(() => ({
  deleteUserAction: vi.fn(),
  getUserByIdAction: vi.fn(),
  generatePasswordAction: vi.fn(),
  setSuperAdminAction: vi.fn(),
}));
vi.mock('../../infrastructure/actions', () => actions);
const perms = vi.hoisted(() => ({ isSuperAdmin: true }));
vi.mock('@/services/auth/permissions/ui/hooks/use-permissions', () => ({
  usePermissions: () => ({ permissions: { isSuperAdmin: perms.isSuperAdmin, resources: [] } }),
}));
vi.mock('@shared/config', () => ({ TokenStorage: { getBusinessToken: () => 'T', getUser: () => ({ id: 1 }) } }));
vi.mock('@/services/mobile-ui', () => ({
  useIsMobile: () => false,
  MobileCard: () => null,
  MobileActionButton: () => null,
  mobileColumn: () => [],
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/iam/users',
  useSearchParams: () => new URLSearchParams(),
}));

import { UsersTable } from './users-table';

const user = (over: Record<string, unknown>) => ({
  id: 2, name: 'Laura', email: 'laura@x.co', phone: '', is_active: true, is_super_user: false,
  roles: [], businesses: [], business_role_assignments: [], created_at: '', updated_at: '', ...over,
});

describe('UsersTable — super admin', () => {
  beforeEach(() => {
    Object.values(actions).forEach((a) => a.mockReset());
    perms.isSuperAdmin = true;
  });

  it('un super admin hace super admin a otro usuario tras confirmar', async () => {
    actions.setSuperAdminAction.mockResolvedValue({ success: true });
    const onRefresh = vi.fn();
    render(<UsersTable users={[user({})]} onRefresh={onRefresh} />);
    const u = userEvent.setup();
    await u.click(screen.getByRole('button', { name: 'Hacer super admin a Laura' }));
    await u.click(screen.getByRole('button', { name: 'Hacer super admin' }));
    await waitFor(() => expect(actions.setSuperAdminAction).toHaveBeenCalledWith({ token: 'T', user_id: 2, enabled: true }));
    expect(await screen.findByRole('status')).toHaveTextContent('Laura ahora es super admin');
    expect(onRefresh).toHaveBeenCalled();
  });

  it('a un super admin se le puede quitar el rol, pero nadie se lo quita a sí mismo', () => {
    render(<UsersTable users={[user({ id: 1, name: 'Yo', is_super_user: true }), user({ id: 3, name: 'Ana', is_super_user: true })]} />);
    expect(screen.queryByRole('button', { name: 'Quitar super admin a Yo' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quitar super admin a Ana' })).toBeInTheDocument();
  });

  it('quien no es super admin no ve la opción', () => {
    perms.isSuperAdmin = false;
    render(<UsersTable users={[user({})]} />);
    expect(screen.queryByRole('button', { name: /super admin/ })).not.toBeInTheDocument();
  });

  it('si la API falla, lo avisa', async () => {
    actions.setSuperAdminAction.mockResolvedValue({ success: false, error: 'Solo un super admin puede dar o quitar este rol' });
    render(<UsersTable users={[user({})]} />);
    const u = userEvent.setup();
    await u.click(screen.getByRole('button', { name: 'Hacer super admin a Laura' }));
    await u.click(screen.getByRole('button', { name: 'Hacer super admin' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Solo un super admin puede dar o quitar este rol');
  });
});
