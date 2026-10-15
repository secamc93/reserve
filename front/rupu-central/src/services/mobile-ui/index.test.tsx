import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MobileCard, mobileColumn, useIsMobile } from './index';

function Probe() {
  return <span>{useIsMobile() ? 'telefono' : 'escritorio'}</span>;
}

function mockMatchMedia(matches: boolean) {
  const listeners = new Set<() => void>();
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
  }));
}

describe('useIsMobile', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sin matchMedia (jsdom) se comporta como escritorio', () => {
    vi.stubGlobal('matchMedia', undefined);
    render(<Probe />);
    expect(screen.getByText('escritorio')).toBeInTheDocument();
  });

  it('es teléfono cuando la consulta (max-width: 767px) coincide', () => {
    mockMatchMedia(true);
    render(<Probe />);
    expect(screen.getByText('telefono')).toBeInTheDocument();
  });

  it('es escritorio cuando la consulta no coincide', () => {
    mockMatchMedia(false);
    render(<Probe />);
    expect(screen.getByText('escritorio')).toBeInTheDocument();
  });
});

describe('MobileCard', () => {
  it('muestra título, campos en pares etiqueta/valor y acciones', () => {
    render(
      <MobileCard
        title="T1-101"
        subtitle="Apartamento"
        fields={[{ label: 'Coeficiente', value: '0.200000' }]}
        actions={<button type="button">Editar</button>}
      />
    );
    expect(screen.getByTitle('T1-101')).toHaveTextContent('T1-101');
    expect(screen.getByText('Coeficiente')).toBeInTheDocument();
    expect(screen.getByText('0.200000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument();
  });

  it('mobileColumn entrega una sola columna que pinta la fila completa', () => {
    const [col] = mobileColumn<{ n: string }>('Unidades', (row) => <span>{row.n}</span>);
    render(<>{col.render(undefined, { n: 'T2-201' }, 0)}</>);
    expect(col.label).toBe('Unidades');
    expect(screen.getByText('T2-201')).toBeInTheDocument();
  });
});
