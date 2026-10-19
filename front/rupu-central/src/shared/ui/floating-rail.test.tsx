import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { BUSINESS_TYPE_CONFIG } from '../config/business-type-config';
import { buildNavItems } from '../utils/navigation';
import { FloatingRail } from './floating-rail';

let pathname = '/properties/7/voting-groups/3';
vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

const items = buildNavItems({
  sidebarItems: BUSINESS_TYPE_CONFIG.horizontal_property.sidebarItems,
  activeBusinessId: 7,
  canAccessIAM: true,
});

const rail = () => screen.getByRole('navigation', { name: 'Módulos' });

beforeEach(() => {
  pathname = '/properties/7/voting-groups/3';
});

describe('FloatingRail', () => {
  it('muestra todos los módulos como iconos con su nombre accesible', () => {
    render(<FloatingRail items={items} />);
    expect(within(rail()).getAllByRole('link').map((l) => l.getAttribute('aria-label'))).toEqual([
      'Resumen', 'Unidades', 'Residentes', 'Visitas', 'Paqueteria', 'Zonas Comunes', 'Parqueaderos', 'Votaciones', 'IAM',
    ]);
  });

  it('marca el módulo de la ruta actual (también en subrutas)', () => {
    render(<FloatingRail items={items} />);
    expect(within(rail()).getByRole('link', { name: 'Votaciones' })).toHaveAttribute('aria-current', 'page');
    expect(within(rail()).getAllByRole('link', { current: 'page' })).toHaveLength(1);
  });

  it('"Cambiar propiedad" solo aparece si viene la acción', async () => {
    const onChangeProperty = vi.fn();
    const { unmount } = render(<FloatingRail items={items} onChangeProperty={onChangeProperty} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Cambiar propiedad' }));
    expect(onChangeProperty).toHaveBeenCalledOnce();
    unmount();
    render(<FloatingRail items={items} />);
    expect(screen.queryByRole('button', { name: 'Cambiar propiedad' })).toBeNull();
  });

  it('sin módulos ni acción (permisos cargando) no muestra nada', () => {
    const { container } = render(<FloatingRail items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
