import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

let pathname = '/properties/7/units';
vi.mock('next/navigation', () => ({ usePathname: () => pathname }));
import { FloatingRail } from './floating-rail';
import { useNavSlot } from './nav-slots';

describe('FloatingRail', () => {
  it('registra el hueco de submenús y lo libera al desmontarse', () => {
    let slot: HTMLElement | null = null;
    function Probe() {
      slot = useNavSlot('submenu');
      return null;
    }
    render(<Probe />);
    expect(slot).toBeNull();
    const { container, unmount } = render(<FloatingRail />);
    expect(slot).not.toBeNull();
    expect(container.contains(slot)).toBe(true);
    act(() => unmount());
    expect(slot).toBeNull();
  });

  it('muestra la marca Rupü primero, antes de los submenús, y no es clickeable', () => {
    let slot: HTMLElement | null = null;
    function Probe() {
      slot = useNavSlot('submenu');
      return null;
    }
    render(<Probe />);
    render(<FloatingRail />);
    const logo = screen.getByRole('img', { name: 'Rupü' });
    expect(logo.closest('a, button')).toBeNull();
    expect(logo.compareDocumentPosition(slot!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('"Cambiar propiedad" solo aparece si viene la acción', async () => {
    const onChangeProperty = vi.fn();
    const { unmount } = render(<FloatingRail onChangeProperty={onChangeProperty} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Cambiar propiedad' }));
    expect(onChangeProperty).toHaveBeenCalledOnce();
    unmount();
    render(<FloatingRail />);
    expect(screen.queryByRole('button', { name: 'Cambiar propiedad' })).toBeNull();
  });

  it('"Tutoriales" lleva a la página de videos y se marca cuando estás ahí', () => {
    const { unmount } = render(<FloatingRail tutorialsHref="/properties/7/tutorials" />);
    const link = screen.getByRole('link', { name: 'Tutoriales' });
    expect(link).toHaveAttribute('href', '/properties/7/tutorials');
    expect(link).not.toHaveAttribute('aria-current');
    unmount();
    pathname = '/properties/7/tutorials';
    render(<FloatingRail tutorialsHref="/properties/7/tutorials" />);
    expect(screen.getByRole('link', { name: 'Tutoriales' })).toHaveAttribute('aria-current', 'page');
    pathname = '/properties/7/units';
  });

  it('sin propiedad elegida no muestra Tutoriales', () => {
    render(<FloatingRail />);
    expect(screen.queryByRole('link', { name: 'Tutoriales' })).not.toBeInTheDocument();
  });
});
