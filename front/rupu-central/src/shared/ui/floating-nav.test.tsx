import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BUSINESS_TYPE_CONFIG } from '../config/business-type-config';
import { buildNavItems } from '../utils/navigation';
import { useNavSlot } from './nav-slots';
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

const launcher = () => screen.getByRole('button', { name: 'Módulos de Tayazal de Suba' });
const modules = () => screen.queryByRole('navigation', { name: 'Módulos' });

beforeEach(() => {
  pathname = '/properties/7/units';
});

describe('FloatingNav — desplegable de módulos', () => {
  it('cerrado deja el icono del módulo actual y, en la misma isla, la ruta propiedad › módulo', () => {
    setup();
    expect(launcher()).toHaveAttribute('aria-expanded', 'false');
    expect(within(launcher()).getByTestId('current-module')).toBeInTheDocument();
    const ruta = screen.getByRole('navigation', { name: 'Ruta' });
    expect(launcher().parentElement).toContainElement(ruta);
    expect(within(ruta).getByRole('link', { name: 'Tayazal de Suba' })).toHaveAttribute('href', '/properties/7');
    expect(within(ruta).getByText('Unidades')).toHaveAttribute('aria-current', 'page');
    expect(modules()).toBeNull();
  });

  it('al desplegar los módulos la ruta se recoge', async () => {
    const { user } = setup();
    await user.click(launcher());
    expect(screen.queryByRole('navigation', { name: 'Ruta' })).toBeNull();
  });

  it('fuera de un módulo (selector de propiedad) no muestra módulo actual', () => {
    pathname = '/properties';
    setup();
    expect(within(launcher()).queryByTestId('current-module')).toBeNull();
  });

  it('se abre al pasar el cursor y se cierra al salir', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const { user } = setup();
      await user.hover(launcher());
      expect(launcher()).toHaveAttribute('aria-expanded', 'true');
      expect(modules()).not.toBeNull();
      await user.unhover(launcher());
      act(() => { vi.advanceTimersByTime(300); });
      expect(modules()).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('pasar del logo a los iconos no lo cierra', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const { user } = setup();
      await user.hover(launcher());
      await user.hover(within(modules()!).getByRole('link', { name: 'Residentes' }));
      act(() => { vi.advanceTimersByTime(300); });
      expect(modules()).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
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

describe('FloatingNav — botones del módulo', () => {
  it('registra el hueco de botones a la izquierda del usuario y lo libera al desmontarse', () => {
    let slot: HTMLElement | null = null;
    function Probe() {
      slot = useNavSlot('actions');
      return null;
    }
    render(<Probe />);
    const { container, unmount } = setup();
    expect(slot).not.toBeNull();
    expect(container.contains(slot)).toBe(true);
    act(() => unmount());
    expect(slot).toBeNull();
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

  it('muestra la ruta donde estoy y cada paso vuelve a su pantalla', () => {
    pathname = '/properties/7/voting-groups/12/attendance';
    setup();
    const ruta = screen.getByRole('navigation', { name: 'Ruta' });
    expect(within(ruta).getByRole('link', { name: 'Tayazal de Suba' })).toHaveAttribute('href', '/properties/7');
    expect(within(ruta).getAllByRole('link', { name: /Votaciones|Asamblea/ }).map((a) => a.getAttribute('href'))).toEqual([
      '/properties/7/voting-groups',
      '/properties/7/voting-groups',
    ]);
    expect(within(ruta).getByText('Asistencia')).toHaveAttribute('aria-current', 'page');
    pathname = '/properties/7/units';
  });
});
