import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FloatingNav, type FloatingNavProps } from './floating-nav';
import { useTopBarSlot } from './top-bar-slot';

function setup(props: Partial<FloatingNavProps> = {}) {
  const onLogout = vi.fn();
  const onOpenProfile = vi.fn();
  const utils = render(
    <FloatingNav
      property={{ id: 7, name: 'Tayazal de Suba' }}
      user={{ name: 'Ana Admin', email: 'ana@x.co' }}
      onLogout={onLogout}
      onOpenProfile={onOpenProfile}
      {...props}
    />,
  );
  return { ...utils, onLogout, onOpenProfile, user: userEvent.setup() };
}

describe('FloatingNav', () => {
  it('muestra la propiedad activa y, sin ella, el nombre de respaldo', () => {
    const { unmount } = setup();
    expect(screen.getByText('Tayazal de Suba')).toBeInTheDocument();
    expect(screen.getByText('Propiedad horizontal')).toBeInTheDocument();
    unmount();
    setup({ property: null, fallbackName: 'IAM' });
    expect(screen.getByText('IAM')).toBeInTheDocument();
    expect(screen.getByText('Elige una propiedad')).toBeInTheDocument();
  });

  it('abre el perfil y cierra sesión', async () => {
    const { user, onOpenProfile, onLogout } = setup();
    await user.click(screen.getByRole('button', { name: 'Perfil de Ana Admin' }));
    expect(onOpenProfile).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('muestra la etiqueta de super admin solo al super admin', () => {
    const { unmount } = setup();
    expect(screen.queryByText('SUPER ADMIN')).toBeNull();
    unmount();
    setup({ user: { name: 'Ana Admin', email: 'ana@x.co', is_super_admin: true } });
    expect(screen.getByText('SUPER ADMIN')).toBeInTheDocument();
  });

  it('registra el hueco central para las pestañas del módulo y lo libera al desmontarse', () => {
    let slot: HTMLElement | null = null;
    function Probe() {
      slot = useTopBarSlot();
      return null;
    }
    render(<Probe />);
    expect(slot).toBeNull();
    const { container, unmount } = setup();
    expect(slot).not.toBeNull();
    expect(container.contains(slot)).toBe(true);
    act(() => unmount());
    expect(slot).toBeNull();
  });
});
