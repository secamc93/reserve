import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setSubmenuSlot } from '../submenu-slot';
import { DsSectionHeader } from './layout';

// next/font solo funciona compilado por Next.
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

function mockMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

const TABS = [
  { id: 'map', label: 'Mapa de cupos' },
  { id: 'assignments', label: 'Asignaciones', count: 3 },
];

function Header({ onChange = () => {} }: { onChange?: (id: string) => void }) {
  return (
    <DsSectionHeader
      tabs={TABS}
      active="map"
      onChange={onChange}
      ariaLabel="Parqueaderos"
      actions={<button type="button">+ Zona</button>}
    />
  );
}

let slot: HTMLDivElement;

beforeEach(() => {
  slot = document.createElement('div');
  document.body.appendChild(slot);
});

afterEach(() => {
  act(() => setSubmenuSlot(null));
  slot.remove();
  vi.unstubAllGlobals();
});

describe('DsSectionHeader — submenús en el riel lateral', () => {
  it('en escritorio con riel, las pestañas pasan al riel como iconos y las acciones se quedan en la página', async () => {
    mockMatchMedia(true);
    act(() => setSubmenuSlot(slot));
    const onChange = vi.fn();
    const { container } = render(<Header onChange={onChange} />);

    const tablist = within(slot).getByRole('tablist', { name: 'Parqueaderos' });
    expect(tablist).toHaveAttribute('aria-orientation', 'vertical');
    // Nombre (y conteo) accesible aunque solo se vea el icono.
    expect(within(tablist).getAllByRole('tab').map((t) => t.getAttribute('aria-label'))).toEqual(['Mapa de cupos', 'Asignaciones · 3']);
    expect(within(tablist).getByRole('tab', { name: 'Mapa de cupos' })).toHaveAttribute('aria-selected', 'true');
    expect(within(tablist).getByRole('tab', { name: 'Mapa de cupos' }).querySelector('svg')).not.toBeNull();
    expect(within(container).queryByRole('tablist')).toBeNull();
    expect(within(container).getByRole('button', { name: '+ Zona' })).toBeInTheDocument();

    await userEvent.setup().click(within(tablist).getByRole('tab', { name: /Asignaciones/ }));
    expect(onChange).toHaveBeenCalledWith('assignments');
  });

  it('una pestaña sin icono propio (bloque, tipo de residente) muestra sus iniciales', () => {
    mockMatchMedia(true);
    act(() => setSubmenuSlot(slot));
    render(<DsSectionHeader tabs={[{ id: 'bloque:Torre A', label: 'Torre A', count: 18 }]} active="bloque:Torre A" />);
    const tab = within(slot).getByRole('tab', { name: 'Torre A · 18' });
    expect(tab.querySelector('svg')).toBeNull();
    expect(tab).toHaveTextContent('TA');
  });

  it('en teléfono las pestañas se quedan en la página aunque exista el riel', () => {
    mockMatchMedia(false);
    act(() => setSubmenuSlot(slot));
    const { container } = render(<Header />);
    expect(within(container).getByRole('tablist', { name: 'Parqueaderos' })).toBeInTheDocument();
    expect(slot).toBeEmptyDOMElement();
  });

  it('sin riel (otros layouts) las pestañas se quedan en la página', () => {
    mockMatchMedia(true);
    const { container } = render(<Header />);
    expect(within(container).getByRole('tablist', { name: 'Parqueaderos' })).toBeInTheDocument();
  });

  it('si el riel aparece después, las pestañas se mueven a él', () => {
    mockMatchMedia(true);
    const { container } = render(<Header />);
    expect(within(container).getByRole('tablist')).toBeInTheDocument();
    act(() => setSubmenuSlot(slot));
    expect(within(slot).getByRole('tablist')).toBeInTheDocument();
    expect(within(container).queryByRole('tablist')).toBeNull();
  });

  it('un encabezado solo con título no pasa al riel', () => {
    mockMatchMedia(true);
    act(() => setSubmenuSlot(slot));
    render(<DsSectionHeader title="Asistencia" />);
    expect(screen.getByText('Asistencia')).toBeInTheDocument();
    expect(slot).toBeEmptyDOMElement();
  });
});
