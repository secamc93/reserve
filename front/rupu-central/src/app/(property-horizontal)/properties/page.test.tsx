import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));
const hook = vi.hoisted(() => ({ reload: vi.fn(), select: vi.fn(), properties: [] as { id: number; name: string }[] }));
vi.mock('@shared/ui', () => ({
  Spinner: () => null,
  useAccessibleProperties: () => ({ properties: hook.properties, loading: false, error: null, reload: hook.reload }),
  selectProperty: hook.select,
}));
const user = vi.hoisted(() => ({ is_super_admin: true }));
vi.mock('@shared/config', () => ({ TokenStorage: { getUser: () => ({ id: 1, ...user }), getActiveBusiness: () => null } }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));
vi.mock('@/services/modules/horizontal-properties/properties/ui/property-cards', () => ({
  PropertyCards: ({ properties }: { properties: { name: string }[] }) => <ul>{properties.map((p) => <li key={p.name}>{p.name}</li>)}</ul>,
}));
const create = vi.hoisted(() => ({ onSuccess: null as null | (() => void), open: false }));
vi.mock('@/services/modules/horizontal-properties/properties/ui/create-property-modal', () => ({
  CreatePropertyModal: ({ isOpen, onSuccess }: { isOpen: boolean; onSuccess: () => void }) => {
    create.open = isOpen;
    create.onSuccess = onSuccess;
    return isOpen ? <div role="dialog" aria-label="Crear Nueva Propiedad Horizontal" /> : null;
  },
}));

import PropertiesPage from './page';

describe('Elegir propiedad — nueva propiedad', () => {
  beforeEach(() => {
    hook.reload.mockReset();
    hook.select.mockReset();
    hook.properties = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
    user.is_super_admin = true;
  });

  it('el super admin abre el formulario y al crear se recarga la lista', async () => {
    render(<PropertiesPage />);
    await userEvent.setup().click(await screen.findByRole('button', { name: '+ Nueva propiedad' }));
    expect(screen.getByRole('dialog', { name: 'Crear Nueva Propiedad Horizontal' })).toBeInTheDocument();
    create.onSuccess?.();
    expect(hook.reload).toHaveBeenCalled();
  });

  it('quien no es super admin no ve el botón', async () => {
    user.is_super_admin = false;
    render(<PropertiesPage />);
    await waitFor(() => expect(screen.getByText('A')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: '+ Nueva propiedad' })).not.toBeInTheDocument();
  });

  it('con una sola propiedad el super admin se queda para poder crear otra; los demás entran directo', async () => {
    hook.properties = [{ id: 1, name: 'Tayazal' }];
    const { unmount } = render(<PropertiesPage />);
    expect(await screen.findByRole('button', { name: '+ Nueva propiedad' })).toBeInTheDocument();
    expect(hook.select).not.toHaveBeenCalled();
    unmount();
    user.is_super_admin = false;
    render(<PropertiesPage />);
    await waitFor(() => expect(hook.select).toHaveBeenCalledWith({ id: 1, name: 'Tayazal' }));
  });
});
