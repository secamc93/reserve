import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BUSINESS_TYPE_CONFIG } from '../config/business-type-config';
import { buildNavItems } from '../utils/navigation';
import { FloatingNav, type FloatingNavProps } from './floating-nav';

let pathname = '/properties/7/units';
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));
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

function setup(props: Partial<FloatingNavProps> = {}) {
  const onLogout = vi.fn();
  const onOpenProfile = vi.fn();
  const utils = render(
    <FloatingNav
      items={items}
      property={{ id: 7, name: 'Tayazal de Suba' }}
      user={{ name: 'Ana Admin', email: 'ana@x.co' }}
      onLogout={onLogout}
      onOpenProfile={onOpenProfile}
      {...props}
    />,
  );
  return { ...utils, onLogout, onOpenProfile, user: userEvent.setup() };
}

const pill = () => screen.getByRole('navigation', { name: 'Navegación principal' });
const moreButton = () => within(pill()).getByRole('button', { expanded: false });
const moreMenu = () => screen.queryByRole('group', { name: 'Más módulos' });

beforeEach(() => {
  pathname = '/properties/7/units';
});

describe('FloatingNav — píldora de módulos', () => {
  it('muestra Resumen, Unidades, Residentes y Votaciones con sus rutas', () => {
    setup();
    const links = within(pill()).getAllByRole('link');
    expect(links.map((l) => l.textContent)).toEqual(['Resumen', 'Unidades', 'Residentes', 'Votaciones']);
    expect(links.map((l) => l.getAttribute('href'))).toEqual([
      '/properties/7', '/properties/7/units', '/properties/7/residents', '/properties/7/voting-groups',
    ]);
  });

  it('marca como página actual solo el módulo de la ruta (no el Resumen)', () => {
    setup();
    expect(within(pill()).getByRole('link', { name: 'Unidades' })).toHaveAttribute('aria-current', 'page');
    expect(within(pill()).getByRole('link', { name: 'Resumen' })).not.toHaveAttribute('aria-current');
  });

  it('"Más" abre el resto de módulos y se cierra con Escape', async () => {
    const { user } = setup();
    expect(moreMenu()).toBeNull();
    await user.click(within(pill()).getByRole('button', { name: /Más/ }));
    const menu = moreMenu();
    expect(menu).not.toBeNull();
    expect(within(menu!).getAllByRole('link').map((l) => l.textContent)).toEqual([
      'Visitas', 'Paqueteria', 'Zonas Comunes', 'Parqueaderos', 'IAM',
    ]);
    await user.keyboard('{Escape}');
    expect(moreMenu()).toBeNull();
  });

  it('si el módulo activo está en "Más", el botón muestra su nombre', () => {
    pathname = '/properties/7/parking/zones';
    setup();
    expect(moreButton()).toHaveTextContent('Parqueaderos');
    expect(within(pill()).queryByRole('link', { current: 'page' })).toBeNull();
  });

  it('sin módulos (permisos cargando) no muestra la píldora vacía', () => {
    setup({ items: [] });
    expect(screen.queryByRole('navigation', { name: 'Navegación principal' })).toBeNull();
  });

  it('sin módulos de sobra no muestra "Más"', () => {
    setup({ items: items.slice(0, 3) });
    expect(within(pill()).queryByRole('button')).toBeNull();
  });
});

describe('FloatingNav — propiedad y usuario', () => {
  it('muestra la propiedad activa', () => {
    setup();
    expect(screen.getByText('Tayazal de Suba')).toBeInTheDocument();
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
});
