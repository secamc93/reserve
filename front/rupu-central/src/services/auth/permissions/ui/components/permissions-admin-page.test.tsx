import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = vi.hoisted(() => ({
  getPermissionsListAction: vi.fn(),
  createPermissionAction: vi.fn(),
  updatePermissionAction: vi.fn(),
  deletePermissionAction: vi.fn(),
}));
vi.mock('../../infrastructure/actions', () => actions);
vi.mock('@/services/auth/actions/infrastructure/actions', () => ({
  getActionsAction: vi.fn().mockResolvedValue({ success: true, data: { actions: [{ id: 1, name: 'Read' }, { id: 3, name: 'Update' }] } }),
}));
vi.mock('@/services/auth/resources/infrastructure/actions', () => ({
  getResourcesAction: vi.fn().mockResolvedValue({ success: true, data: { resources: [{ id: 9, name: 'Visitas', business_type_id: 1 }] } }),
}));
vi.mock('@/services/auth/business-types/infrastructure/actions', () => ({
  getBusinessTypesAction: vi.fn().mockResolvedValue({ success: true, data: { businessTypes: [{ id: 1, name: 'Propiedad Horizontal' }] } }),
}));
vi.mock('@shared/config', () => ({ TokenStorage: { getBusinessToken: () => 'T' } }));
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));
const nav = vi.hoisted(() => ({ search: '' }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/iam/permissions',
  useSearchParams: () => new URLSearchParams(nav.search),
}));

import { PermissionsAdminPage } from './permissions-admin-page';

const perm = (id: number, resource: string, action: string, extra: Record<string, unknown> = {}) => ({
  id, name: `${action} ${resource}`, description: '', resource, resourceId: id * 10, action, actionId: 1, scopeId: 2, scopeName: 'Negocio', scopeCode: 'business', businessTypeId: 1, businessTypeName: 'Propiedad Horizontal', ...extra,
});

describe('Avanzado › Permisos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nav.search = '';
    actions.getPermissionsListAction.mockResolvedValue({
      success: true,
      data: { permissions: [perm(1, 'Visitas', 'Read'), perm(2, 'Visitas', 'Update'), perm(3, 'Asistencia', 'Read')] },
    });
    actions.deletePermissionAction.mockResolvedValue({ success: true });
    actions.createPermissionAction.mockResolvedValue({ success: true });
  });

  it('agrupa por módulo y muestra la acción en español', async () => {
    render(<PermissionsAdminPage />);
    const table = await screen.findByRole('table', { name: 'Permisos' });
    expect(within(table).getByRole('rowgroup', { name: 'Visitas' })).toHaveTextContent('2 permisos');
    expect(within(table).getByRole('rowgroup', { name: 'Asistencia' })).toHaveTextContent('1 permiso');
    expect(within(table).getAllByText('Ver')).toHaveLength(2);
    expect(within(table).getByText('Editar')).toBeInTheDocument();
  });

  it('filtra por acción desde la URL', async () => {
    nav.search = 'accion=Update';
    render(<PermissionsAdminPage />);
    const table = await screen.findByRole('table', { name: 'Permisos' });
    await waitFor(() => expect(within(table).queryByRole('rowgroup', { name: 'Asistencia' })).not.toBeInTheDocument());
    expect(within(table).getByText('Update Visitas')).toBeInTheDocument();
    expect(screen.getByText('1 de 3 permisos')).toBeInTheDocument();
  });

  it('elimina tras confirmar y recarga la lista', async () => {
    const u = userEvent.setup();
    render(<PermissionsAdminPage />);
    await u.click(await screen.findByRole('button', { name: 'Acciones de Read Asistencia' }));
    await u.click(screen.getByRole('menuitem', { name: 'Eliminar' }));
    await u.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(actions.deletePermissionAction).toHaveBeenCalledWith({ id: 3, token: 'T' }));
    expect(await screen.findByText('Permiso "Read Asistencia" eliminado.')).toBeInTheDocument();
    expect(actions.getPermissionsListAction).toHaveBeenCalledTimes(2);
  });

  it('al crear propone el nombre con el módulo y la acción', async () => {
    const u = userEvent.setup();
    render(<PermissionsAdminPage />);
    await u.click(await screen.findByRole('button', { name: 'Nuevo permiso' }));
    const dialog = screen.getByRole('dialog', { name: 'Nuevo permiso' });
    await within(dialog).findByRole('option', { name: 'Visitas' });
    await u.selectOptions(within(dialog).getByLabelText('Módulo (recurso)'), 'Visitas');
    await u.selectOptions(within(dialog).getByLabelText('Acción'), 'Editar');
    expect(within(dialog).getByLabelText('Nombre')).toHaveValue('Editar Visitas');
    await u.click(within(dialog).getByRole('button', { name: 'Crear permiso' }));
    await waitFor(() =>
      expect(actions.createPermissionAction).toHaveBeenCalledWith(
        { name: 'Editar Visitas', description: '', resource_id: 9, action_id: 3, scope_id: 2, business_type_id: 1 },
        'T',
      ),
    );
  });
});
