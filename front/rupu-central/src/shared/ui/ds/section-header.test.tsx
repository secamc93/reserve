import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setTopBarSlot } from '../top-bar-slot';
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
  act(() => setTopBarSlot(null));
  slot.remove();
  vi.unstubAllGlobals();
});

describe('DsSectionHeader — pestañas en la barra superior', () => {
  it('en escritorio con barra flotante, las pestañas suben a la barra y las acciones se quedan en la página', async () => {
    mockMatchMedia(true);
    act(() => setTopBarSlot(slot));
    const onChange = vi.fn();
    const { container } = render(<Header onChange={onChange} />);

    const tablist = within(slot).getByRole('tablist', { name: 'Parqueaderos' });
    expect(within(tablist).getAllByRole('tab').map((t) => t.textContent)).toEqual(['Mapa de cupos', 'Asignaciones · 3']);
    expect(within(tablist).getByRole('tab', { name: 'Mapa de cupos' })).toHaveAttribute('aria-selected', 'true');
    expect(within(container).queryByRole('tablist')).toBeNull();
    expect(within(container).getByRole('button', { name: '+ Zona' })).toBeInTheDocument();

    await userEvent.setup().click(within(tablist).getByRole('tab', { name: /Asignaciones/ }));
    expect(onChange).toHaveBeenCalledWith('assignments');
  });

  it('en teléfono las pestañas se quedan en la página aunque exista la barra', () => {
    mockMatchMedia(false);
    act(() => setTopBarSlot(slot));
    const { container } = render(<Header />);
    expect(within(container).getByRole('tablist', { name: 'Parqueaderos' })).toBeInTheDocument();
    expect(slot).toBeEmptyDOMElement();
  });

  it('sin barra flotante (otros layouts) las pestañas se quedan en la página', () => {
    mockMatchMedia(true);
    const { container } = render(<Header />);
    expect(within(container).getByRole('tablist', { name: 'Parqueaderos' })).toBeInTheDocument();
  });

  it('si la barra aparece después, las pestañas se mueven a ella', () => {
    mockMatchMedia(true);
    const { container } = render(<Header />);
    expect(within(container).getByRole('tablist')).toBeInTheDocument();
    act(() => setTopBarSlot(slot));
    expect(within(slot).getByRole('tablist')).toBeInTheDocument();
    expect(within(container).queryByRole('tablist')).toBeNull();
  });

  it('un encabezado solo con título no sube a la barra', () => {
    mockMatchMedia(true);
    act(() => setTopBarSlot(slot));
    render(<DsSectionHeader title="Asistencia" />);
    expect(screen.getByText('Asistencia')).toBeInTheDocument();
    expect(slot).toBeEmptyDOMElement();
  });
});
