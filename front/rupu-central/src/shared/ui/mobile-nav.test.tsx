import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BUSINESS_TYPE_CONFIG } from '../config/business-type-config';
import { buildNavItems } from '../utils/navigation';
import { MobileNav, type MobileNavProps } from './mobile-nav';
import { PropertyLogo } from './property-logo';

let pathname = '/properties/7/units';
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));
// Link de Next como <a> simple (el onClick del menú sigue funcionando).
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest} onClick={(e) => { e.preventDefault(); rest.onClick?.(e); }}>
      {children}
    </a>
  ),
}));

const items = buildNavItems({
  sidebarItems: BUSINESS_TYPE_CONFIG.horizontal_property.sidebarItems,
  activeBusinessId: 7,
  canAccessIAM: true,
});

function setup(props: Partial<MobileNavProps> = {}) {
  const onLogout = vi.fn();
  const onChangeProperty = vi.fn();
  const onOpenProfile = vi.fn();
  const utils = render(
    <MobileNav
      items={items}
      property={{ id: 7, name: 'Tayazal de Suba' }}
      user={{ name: 'Ana Admin', email: 'ana@x.co', role: 'Administrador' }}
      onLogout={onLogout}
      onChangeProperty={onChangeProperty}
      onOpenProfile={onOpenProfile}
      {...props}
    />,
  );
  return { ...utils, onLogout, onChangeProperty, onOpenProfile, user: userEvent.setup() };
}

const logo = () => screen.getByRole('button', { name: 'Abrir menú de módulos' });
const sheet = () => screen.queryByRole('dialog', { name: 'Menú de módulos' });

beforeEach(() => {
  pathname = '/properties/7/units';
  document.body.style.overflow = '';
});

describe('MobileNav — barra inferior', () => {
  it('muestra 2 accesos a cada lado y el logo con iniciales en el centro', () => {
    setup();
    const bar = screen.getByRole('navigation', { name: 'Navegación inferior' });
    const links = within(bar).getAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual(['Inicio', 'Residentes', 'Paquetes', 'Votaciones']);
    expect(links[0]).toHaveAttribute('href', '/properties/7');
    // Orden en el DOM: 2 enlaces, logo, 2 enlaces.
    const order = within(bar).getAllByRole('listitem').map((li) => (within(li).queryByRole('button') ? 'logo' : li.textContent));
    expect(order).toEqual(['Inicio', 'Residentes', 'logo', 'Paquetes', 'Votaciones']);
    expect(within(logo()).getByText('TS')).toBeInTheDocument();
    expect(logo()).toHaveAttribute('aria-expanded', 'false');
  });

  it('marca el módulo actual con aria-current (Inicio no queda activo en un submódulo)', () => {
    pathname = '/properties/7/residents';
    setup();
    const bar = screen.getByRole('navigation', { name: 'Navegación inferior' });
    expect(within(bar).getByRole('link', { name: 'Residentes' })).toHaveAttribute('aria-current', 'page');
    expect(within(bar).getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current');
  });

  it('usa el logo de la propiedad si existe y el nombre de respaldo si no hay propiedad', () => {
    const { unmount } = setup({ property: { id: 7, name: 'Tayazal de Suba', logoUrl: 'https://cdn/logo.png' } });
    expect(logo().querySelector('img')).toHaveAttribute('src', 'https://cdn/logo.png');
    unmount();
    setup({ property: null, fallbackName: 'IAM' });
    expect(within(logo()).getByText('I')).toBeInTheDocument();
  });
});

describe('MobileNav — menú de módulos', () => {
  it('el logo abre el menú con la propiedad, el usuario, todos los módulos y las acciones', async () => {
    const { user } = setup();
    expect(sheet()).toBeNull();
    await user.click(logo());

    const dialog = sheet()!;
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(logo()).toHaveAttribute('aria-expanded', 'true');
    expect(within(dialog).getByText('Tayazal de Suba')).toBeInTheDocument();
    expect(within(dialog).getByText('Ana Admin · Administrador')).toBeInTheDocument();
    const modules = within(within(dialog).getByRole('navigation', { name: 'Módulos' })).getAllByRole('link');
    expect(modules.map((m) => m.textContent)).toEqual(items.map((i) => i.label));
    for (const name of ['Mi perfil', 'Cambiar propiedad', 'Cerrar sesión', 'Cerrar']) {
      expect(within(dialog).getByRole('button', { name })).toBeInTheDocument();
    }
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('el menú tiene el acceso a Tutoriales cuando hay propiedad', async () => {
    const { user } = setup({ tutorialsHref: '/properties/7/tutorials' });
    await user.click(logo());
    expect(within(sheet()!).getByRole('link', { name: 'Tutoriales' })).toHaveAttribute('href', '/properties/7/tutorials');
  });

  it('Esc cierra y devuelve el foco al logo', async () => {
    const { user } = setup();
    await user.click(logo());
    expect(sheet()).not.toBeNull();
    expect(sheet()!.contains(document.activeElement)).toBe(true);
    await user.keyboard('{Escape}');
    expect(sheet()).toBeNull();
    expect(logo()).toHaveAttribute('aria-expanded', 'false');
    expect(logo()).toHaveFocus();
    expect(document.body.style.overflow).toBe('');
  });

  it('tocar el fondo cierra', async () => {
    const { user } = setup();
    await user.click(logo());
    await user.click(screen.getByTestId('bottom-sheet-backdrop'));
    expect(sheet()).toBeNull();
  });

  it('el botón Cerrar cierra', async () => {
    const { user } = setup();
    await user.click(logo());
    await user.click(within(sheet()!).getByRole('button', { name: 'Cerrar' }));
    expect(sheet()).toBeNull();
  });

  it('deslizar hacia abajo más de 80 px cierra; menos, no', async () => {
    const { user } = setup();
    await user.click(logo());
    const handle = within(sheet()!).getByRole('button', { name: 'Cerrar' }).closest('div')!.parentElement!;
    fireEvent.touchStart(handle, { touches: [{ clientY: 100 }] });
    fireEvent.touchMove(handle, { touches: [{ clientY: 140 }] });
    fireEvent.touchEnd(handle);
    expect(sheet()).not.toBeNull();
    fireEvent.touchStart(handle, { touches: [{ clientY: 100 }] });
    fireEvent.touchMove(handle, { touches: [{ clientY: 260 }] });
    fireEvent.touchEnd(handle);
    expect(sheet()).toBeNull();
  });

  it('elegir el módulo de la página actual cierra el menú (los demás cierran al cambiar la ruta)', async () => {
    const { user } = setup();
    await user.click(logo());
    await user.click(within(sheet()!).getByRole('link', { name: 'Parqueaderos' }));
    // Otro módulo: sigue abierto hasta que Next cambie la ruta (cerrar antes cancela la navegación).
    expect(sheet()).not.toBeNull();
    await user.click(within(sheet()!).getByRole('link', { name: 'Unidades' }));
    expect(sheet()).toBeNull();
  });

  it('si cambia la ruta (navegación), el menú se cierra', async () => {
    const { user, rerender } = setup();
    await user.click(logo());
    pathname = '/properties/7/visits';
    act(() => {
      rerender(
        <MobileNav items={items} property={null} user={{ name: 'Ana', email: 'a@x.co' }} onLogout={vi.fn()} onChangeProperty={vi.fn()} />,
      );
    });
    expect(sheet()).toBeNull();
  });

  it('el foco queda atrapado: Tab desde el último vuelve al primero y Shift+Tab al revés', async () => {
    const { user } = setup();
    await user.click(logo());
    const dialog = sheet()!;
    const close = within(dialog).getByRole('button', { name: 'Cerrar' });
    const logout = within(dialog).getByRole('button', { name: 'Cerrar sesión' });
    expect(close).toHaveFocus();
    logout.focus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(logout).toHaveFocus();
  });

  it('Cerrar sesión y Cambiar propiedad cierran el menú y llaman a su acción', async () => {
    const { user, onLogout, onChangeProperty } = setup();
    await user.click(logo());
    await user.click(within(sheet()!).getByRole('button', { name: 'Cambiar propiedad' }));
    expect(onChangeProperty).toHaveBeenCalledTimes(1);
    expect(sheet()).toBeNull();
    await user.click(logo());
    await user.click(within(sheet()!).getByRole('button', { name: 'Cerrar sesión' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('muestra el contenido extra (selector de propiedad) dentro del menú', async () => {
    const { user } = setup({ sheetExtra: <label>Propiedad<select aria-label="Propiedad activa" /></label> });
    expect(screen.queryByLabelText('Propiedad activa')).toBeNull();
    await user.click(logo());
    expect(within(sheet()!).getByLabelText('Propiedad activa')).toBeInTheDocument();
  });
});

describe('PropertyLogo', () => {
  it('si la imagen falla, vuelve a las iniciales', () => {
    render(<PropertyLogo name="Tayazal de Suba" logoUrl="https://cdn/roto.png" />);
    const img = screen.getByTestId('property-logo').querySelector('img')!;
    fireEvent.error(img);
    expect(screen.getByText('TS')).toBeInTheDocument();
  });

  it('con una sola propiedad no muestra "Cambiar propiedad"', async () => {
    const { user } = setup({ onChangeProperty: undefined });
    await user.click(logo());
    expect(within(sheet()!).queryByRole('button', { name: 'Cambiar propiedad' })).not.toBeInTheDocument();
    expect(within(sheet()!).getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });
});
