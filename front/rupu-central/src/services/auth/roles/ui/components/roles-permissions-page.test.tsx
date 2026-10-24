import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const roleActions = vi.hoisted(() => ({
  getRolesAction: vi.fn(),
  getRolePermissionsAction: vi.fn(),
  assignRolePermissionsAction: vi.fn(),
  updateRoleAction: vi.fn(),
}));
vi.mock('../../infrastructure/actions', () => roleActions);
const permissionActions = vi.hoisted(() => ({ getPermissionsListAction: vi.fn() }));
vi.mock('@/services/auth/permissions/infrastructure/actions', () => permissionActions);
const userActions = vi.hoisted(() => ({ getUsersAction: vi.fn() }));
vi.mock('@/services/auth/users/infrastructure/actions', () => userActions);
vi.mock('@shared/config', () => ({ TokenStorage: { getBusinessToken: () => 'T' } }));
// Los modales de crear/editar rol tienen sus propias dependencias; aquí no se abren.
vi.mock('./create-role-modal', () => ({ CreateRoleModal: () => null }));
vi.mock('./update-role-modal', () => ({ UpdateRoleModal: () => null }));
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));
const nav = vi.hoisted(() => ({ search: 'rol=2', replace: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: nav.replace }),
  usePathname: () => '/iam/roles',
  useSearchParams: () => new URLSearchParams(nav.search),
}));

import { RolesPermissionsPage } from './roles-permissions-page';

const role = (id: number, name: string, extra: Record<string, unknown> = {}) => ({
  id, name, code: name.toLowerCase(), description: '', level: 1, isSystem: false, scopeId: 2, scopeName: 'Business', scopeCode: 'business', businessTypeId: 5, ...extra,
});

describe('Roles y permisos — matriz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    roleActions.getRolesAction.mockResolvedValue({ success: true, data: { roles: [role(1, 'Administrador'), role(2, 'Portería')] } });
    permissionActions.getPermissionsListAction.mockResolvedValue({
      success: true,
      data: {
        permissions: [
          { id: 10, resource: 'Visitas', action: 'Read' },
          { id: 11, resource: 'Visitas', action: 'Create' },
          { id: 12, resource: 'Votaciones', action: 'Read' },
        ],
      },
    });
    // 99 no está en la matriz (p. ej. de otro tipo de negocio): debe sobrevivir al guardar.
    roleActions.getRolePermissionsAction.mockResolvedValue({ success: true, data: { permissions: [{ id: 10, resource: 'Visitas', action: 'Read' }, { id: 99, resource: 'Otro', action: 'Read' }] } });
    roleActions.assignRolePermissionsAction.mockResolvedValue({ success: true });
    userActions.getUsersAction.mockResolvedValue({ success: true, data: { count: 12, users: [] } });
  });

  it('muestra el rol de la URL con sus permisos y el nivel de cada módulo', async () => {
    render(<RolesPermissionsPage />);
    const panel = await screen.findByRole('region', { name: 'Permisos del rol Portería' });
    await waitFor(() => expect(within(panel).getByRole('checkbox', { name: 'Visitas: ver' })).toBeChecked());
    expect(within(panel).getByRole('checkbox', { name: 'Visitas: crear' })).not.toBeChecked();
    expect(within(panel).getByRole('row', { name: /Visitas/ })).toHaveTextContent('Solo ver');
    expect(within(panel).getByRole('row', { name: /Votaciones/ })).toHaveTextContent('Sin acceso');
    expect(within(panel).getByRole('link', { name: '12 usuarios con este rol' })).toHaveAttribute('href', '/iam/users?rol=2');
    expect(permissionActions.getPermissionsListAction).toHaveBeenCalledWith('T', { business_type_id: 5 });
  });

  it('guarda el conjunto completo: lo marcado más lo que el rol tenía fuera de la matriz', async () => {
    const u = userEvent.setup();
    render(<RolesPermissionsPage />);
    const crear = await screen.findByRole('checkbox', { name: 'Visitas: crear' });
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Visitas: ver' })).toBeChecked());
    await u.click(crear);
    await u.click(screen.getByRole('checkbox', { name: 'Votaciones: ver' }));
    const bar = screen.getByRole('region', { name: 'Cambios sin guardar' });
    expect(bar).toHaveTextContent('2 cambios sin guardar · afecta a 12 usuarios');
    await u.click(within(bar).getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() =>
      expect(roleActions.assignRolePermissionsAction).toHaveBeenCalledWith({ role_id: 2, permission_ids: [10, 11, 12, 99] }, 'T'),
    );
    expect(await screen.findByText(/Permisos de Portería guardados/)).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Cambios sin guardar' })).not.toBeInTheDocument();
  });

  it('descartar vuelve a lo guardado sin llamar al back', async () => {
    const u = userEvent.setup();
    render(<RolesPermissionsPage />);
    const crear = await screen.findByRole('checkbox', { name: 'Visitas: crear' });
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Visitas: ver' })).toBeChecked());
    await u.click(crear);
    await u.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(crear).not.toBeChecked();
    expect(roleActions.assignRolePermissionsAction).not.toHaveBeenCalled();
  });

  it('con cambios sin guardar, cambiar de rol pide confirmación', async () => {
    const u = userEvent.setup();
    render(<RolesPermissionsPage />);
    const crear = await screen.findByRole('checkbox', { name: 'Visitas: crear' });
    await waitFor(() => expect(screen.getByRole('checkbox', { name: 'Visitas: ver' })).toBeChecked());
    await u.click(crear);
    await u.click(within(screen.getByRole('navigation', { name: 'Roles' })).getByRole('button', { name: /Administrador/ }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveTextContent('¿Descartar los cambios de Portería?');
    await u.click(within(dialog).getByRole('button', { name: 'Descartar y cambiar' }));
    expect(nav.replace).toHaveBeenCalledWith('/iam/roles?rol=1', { scroll: false });
  });
});
