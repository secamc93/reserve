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

const launcher = () => screen.getByRole('button', { name: /Módulos de Tayazal de Suba|Cerrar módulos/ });
const modules = () => screen.queryByRole('navigation', { name: 'Módulos' });

beforeEach(() => {
  pathname = '/properties/7/units';
});

describe('FloatingNav — desplegable de módulos', () => {
  it('cerrado muestra la propiedad y el módulo actual, sin la lista de módulos', () => {
    setup();
    expect(launcher()).toHaveAttribute('aria-expanded', 'false');
    expect(within(launcher()).getByText('Tayazal de Suba')).toBeInTheDocument();
    expect(within(launcher()).getByText('Unidades')).toBeInTheDocument();
    expect(modules()).toBeNull();
  });

  it('el logo abre todos los módulos como iconos con nombre accesible y marca el actual', async () => {
    const { user } = setup();
    await user.click(launcher());
    expect(launcher()).toHaveAttribute('aria-expanded', 'true');
    const links = within(modules()!).getAllByRole('link');
    expect(links.map((l) => l.getAttribute('aria-label'))).toEqual([
      'Resumen', 'Unidades', 'Residentes', 'Visitas', 'Paqueteria', 'Zonas Comunes', 'Parqueaderos', 'Votaciones', 'IAM',
    ]);
    expect(within(modules()!).getByRole('link', { name: 'Unidades' })).toHaveAttribute('aria-current', 'page');
    expect(within(modules()!).getByRole('link', { name: 'Votaciones' })).toHaveAttribute('href', '/properties/7/voting-groups');
  });

  it('elegir un módulo cierra el desplegable', async () => {
    const { user } = setup();
    await user.click(launcher());
    await user.click(within(modules()!).getByRole('link', { name: 'Votaciones' }));
    expect(modules()).toBeNull();
  });

  it('se cierra con Escape y con clic fuera', async () => {
    const { user } = setup();
    await user.click(launcher());
    await user.keyboard('{Escape}');
    expect(modules()).toBeNull();
    await user.click(launcher());
    await user.click(document.body);
    expect(modules()).toBeNull();
  });
});

describe('FloatingNav — usuario', () => {
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
