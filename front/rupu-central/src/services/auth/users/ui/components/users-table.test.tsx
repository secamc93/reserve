import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = vi.hoisted(() => ({
  deleteUserAction: vi.fn(),
  generatePasswordAction: vi.fn(),
  setSuperAdminAction: vi.fn(),
  updateUserAction: vi.fn(),
}));
vi.mock('../../infrastructure/actions', () => actions);
const perms = vi.hoisted(() => ({ isSuperAdmin: true }));
vi.mock('@/services/auth/permissions/ui/hooks/use-permissions', () => ({
  usePermissions: () => ({ permissions: { isSuperAdmin: perms.isSuperAdmin, resources: [] } }),
}));
vi.mock('@shared/config', () => ({ TokenStorage: { getBusinessToken: () => 'T', getUser: () => ({ id: 1 }) } }));
// next/font solo funciona compilado por Next.
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import { UsersTable } from './users-table';
import { useUserActions, type UserRow } from './user-actions';

const user = (over: Partial<UserRow>): UserRow => ({
  id: 2, name: 'Laura', email: 'laura@x.co', phone: '', is_active: true, is_super_user: false,
  roles: [], businesses: [], business_role_assignments: [], created_at: '', updated_at: '', ...over,
});

function Harness({ users, onChanged = () => {} }: { users: UserRow[]; onChanged?: () => void }) {
  const a = useUserActions({ onChanged });
  return (
    <>
      {a.noticeBar}
      <UsersTable users={users} menuItems={a.menuItems} />
      {a.dialogs}
    </>
  );
}

async function openMenu(name: string) {
  const u = userEvent.setup();
  await u.click(screen.getByRole('button', { name: `Acciones de ${name}` }));
  return { u, menu: screen.getByRole('menu', { name: `Acciones de ${name}` }) };
}

describe('Usuarios — fila y acciones', () => {
  beforeEach(() => {
    Object.values(actions).forEach((a) => a.mockReset());
    perms.isSuperAdmin = true;
  });

  it('muestra el rol por propiedad y avisa cuando no tiene rol', () => {
    render(
      <Harness
        users={[
          user({ id: 2, business_role_assignments: [{ business_id: 7, business_name: 'Tayazal', role_id: 3, role_name: 'Portería' }] }),
          user({ id: 3, name: 'Paola' }),
        ]}
      />,
    );
    expect(screen.getByText('Portería · Tayazal')).toBeInTheDocument();
    expect(screen.getByText('Sin rol asignado')).toBeInTheDocument();
  });

  it('un super admin hace super admin a otro usuario tras confirmar', async () => {
    actions.setSuperAdminAction.mockResolvedValue({ success: true });
    const onChanged = vi.fn();
    render(<Harness users={[user({})]} onChanged={onChanged} />);
    const { u, menu } = await openMenu('Laura');
    await u.click(within(menu).getByRole('menuitem', { name: 'Hacer super admin' }));
    await u.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Hacer super admin' }));
    await waitFor(() => expect(actions.setSuperAdminAction).toHaveBeenCalledWith({ token: 'T', user_id: 2, enabled: true }));
    expect(await screen.findByRole('status')).toHaveTextContent('Laura ahora es super admin');
    expect(onChanged).toHaveBeenCalled();
  });

  it('a un super admin se le puede quitar el rol, pero nadie se lo quita a sí mismo', async () => {
    render(<Harness users={[user({ id: 1, name: 'Yo', is_super_user: true }), user({ id: 3, name: 'Ana', is_super_user: true })]} />);
    let { menu } = await openMenu('Yo');
    expect(within(menu).queryByRole('menuitem', { name: 'Quitar super admin' })).not.toBeInTheDocument();
    await userEvent.setup().keyboard('{Escape}');
    ({ menu } = await openMenu('Ana'));
    expect(within(menu).getByRole('menuitem', { name: 'Quitar super admin' })).toBeInTheDocument();
  });

  it('quien no es super admin no ve la opción', async () => {
    perms.isSuperAdmin = false;
    render(<Harness users={[user({})]} />);
    const { menu } = await openMenu('Laura');
    expect(within(menu).queryByRole('menuitem', { name: /super admin/ })).not.toBeInTheDocument();
  });

  it('si la API falla, lo avisa', async () => {
    actions.setSuperAdminAction.mockResolvedValue({ success: false, error: 'Solo un super admin puede dar o quitar este rol' });
    render(<Harness users={[user({})]} />);
    const { u, menu } = await openMenu('Laura');
    await u.click(within(menu).getByRole('menuitem', { name: 'Hacer super admin' }));
    await u.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Hacer super admin' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Solo un super admin puede dar o quitar este rol');
  });

  it('desactivar envía is_active=false y avisa', async () => {
    actions.updateUserAction.mockResolvedValue({ success: true });
    render(<Harness users={[user({})]} />);
    const { u, menu } = await openMenu('Laura');
    await u.click(within(menu).getByRole('menuitem', { name: 'Desactivar' }));
    await u.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Desactivar' }));
    await waitFor(() => expect(actions.updateUserAction).toHaveBeenCalledWith({ token: 'T', id: 2, is_active: false }));
    expect(await screen.findByRole('status')).toHaveTextContent('Laura quedó inactivo');
  });

  it('restablecer clave muestra la clave nueva una sola vez', async () => {
    actions.generatePasswordAction.mockResolvedValue({ success: true, data: { email: 'laura@x.co', password: 'Nueva-123' } });
    render(<Harness users={[user({})]} />);
    const { u, menu } = await openMenu('Laura');
    await u.click(within(menu).getByRole('menuitem', { name: 'Restablecer clave' }));
    await u.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Generar clave nueva' }));
    expect(await screen.findByText('Nueva-123')).toBeInTheDocument();
    await u.click(screen.getByRole('button', { name: 'Listo, ya la copié' }));
    expect(screen.queryByText('Nueva-123')).not.toBeInTheDocument();
  });
});
