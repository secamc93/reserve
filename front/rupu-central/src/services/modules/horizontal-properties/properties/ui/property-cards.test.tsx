import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));
const actions = vi.hoisted(() => ({ getPropertyOverviewAction: vi.fn() }));
vi.mock('../infrastructure/actions', () => actions);
const user = vi.hoisted(() => ({ is_super_admin: true }));
vi.mock('@shared/config', () => ({ TokenStorage: { getBusinessToken: () => 'T', getUser: () => user } }));
vi.mock('@shared/ui', () => ({
  PropertyLogo: ({ name }: { name: string }) => <span>{name[0]}</span>,
  Spinner: () => null,
  selectProperty: vi.fn().mockResolvedValue({ success: true }),
}));

import { PropertyCards, readiness } from './property-cards';

const overview = (over = {}) => ({ id: 1, address: 'Calle 1', description: 'Conjunto de 2 torres', units: 50, coefficientSum: 100, residents: 48, owners: 40, tenants: 8, ...over });

describe('PropertyCards', () => {
  beforeEach(() => {
    actions.getPropertyOverviewAction.mockReset();
    user.is_super_admin = true;
  });

  it('muestra dirección, descripción, unidades, residentes y coeficiente', async () => {
    actions.getPropertyOverviewAction.mockResolvedValue({ success: true, data: overview() });
    render(<PropertyCards properties={[{ id: 1, name: 'Los Pinos' }]} activeId={null} />);
    const card = screen.getByRole('button', { name: 'Abrir Los Pinos' });
    expect(await within(card).findByText('Calle 1')).toBeInTheDocument();
    expect(within(card).getByText('Conjunto de 2 torres')).toBeInTheDocument();
    expect(within(card).getByText('50')).toBeInTheDocument();
    expect(within(card).getByText('40 prop. · 8 arr.')).toBeInTheDocument();
    expect(within(card).getByText('100 %')).toBeInTheDocument();
    expect(within(card).getByText(/Lista para asambleas/)).toBeInTheDocument();
    expect(actions.getPropertyOverviewAction).toHaveBeenCalledWith({ token: 'T', businessId: 1 });
  });

  it('un usuario normal solo ve el resumen de su propiedad activa', async () => {
    user.is_super_admin = false;
    actions.getPropertyOverviewAction.mockResolvedValue({ success: true, data: overview({ id: 2 }) });
    render(<PropertyCards properties={[{ id: 1, name: 'A' }, { id: 2, name: 'B' }]} activeId={2} />);
    expect(await screen.findByText('Ábrela para ver su información')).toBeInTheDocument();
    expect(actions.getPropertyOverviewAction).toHaveBeenCalledTimes(1);
    expect(actions.getPropertyOverviewAction).toHaveBeenCalledWith({ token: 'T', businessId: 2 });
  });
});

describe('readiness', () => {
  it('dice qué falta para hacer asambleas', () => {
    expect(readiness(overview({ units: 0 })).text).toMatch(/Falta cargar las unidades/);
    expect(readiness(overview({ coefficientSum: 87.5 })).text).toMatch(/suman 87,5 %/);
    expect(readiness(overview({ residents: 0 })).text).toMatch(/Falta cargar los residentes/);
    expect(readiness(overview())).toEqual({ ok: true, text: 'Lista para asambleas' });
  });
});
