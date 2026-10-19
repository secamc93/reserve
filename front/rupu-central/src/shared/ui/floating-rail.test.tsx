import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FloatingRail } from './floating-rail';
import { useSubmenuSlot } from './submenu-slot';

describe('FloatingRail', () => {
  it('registra el hueco de submenús y lo libera al desmontarse', () => {
    let slot: HTMLElement | null = null;
    function Probe() {
      slot = useSubmenuSlot();
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

  it('"Cambiar propiedad" solo aparece si viene la acción', async () => {
    const onChangeProperty = vi.fn();
    const { unmount } = render(<FloatingRail onChangeProperty={onChangeProperty} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Cambiar propiedad' }));
    expect(onChangeProperty).toHaveBeenCalledOnce();
    unmount();
    render(<FloatingRail />);
    expect(screen.queryByRole('button', { name: 'Cambiar propiedad' })).toBeNull();
  });
});
