import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();
const push = vi.fn();
let search = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push }),
  usePathname: () => '/properties/1/units',
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'f-sans', className: 'f-sans' }),
  JetBrains_Mono: () => ({ variable: 'f-mono', className: 'f-mono' }),
}));

const actions = vi.hoisted(() => ({
  getPropertyUnitsAction: vi.fn(),
  getPropertyUnitsSummaryAction: vi.fn(),
  deletePropertyUnitAction: vi.fn(),
  createPropertyUnitAction: vi.fn(),
  updatePropertyUnitAction: vi.fn(),
  importUnitsFromExcelAction: vi.fn(),
}));
vi.mock('../infrastructure/actions', () => actions);
vi.mock('./business-token', () => ({ getUnitsBusinessToken: vi.fn().mockResolvedValue('T') }));

import { PropertyUnitsTable } from './property-units-table';

const unit = (id: number, number: string, block: string, extra: object = {}) => ({
  id, businessId: 1, number, block, unitType: 'house', coefficient: 0.503, isActive: true, createdAt: '', updatedAt: '', ...extra,
});

const summary = {
  total: 194,
  active: 194,
  withResidents: 190,
  coefficientSum: 100,
  blocks: [
    { block: 'Casa', total: 156, active: 156, coefficientSum: 78.568 },
    { block: 'Dúplex', total: 12, active: 12, coefficientSum: 6.101 },
    { block: 'Jardín', total: 1, active: 1, coefficientSum: 0 },
    { block: 'Local', total: 25, active: 25, coefficientSum: 15.331 },
  ],
};

/** Query de la última navegación con replace. */
const lastQuery = () => new URLSearchParams(String(replace.mock.calls.at(-1)?.[0]).split('?')[1] ?? '');

beforeEach(() => {
  vi.clearAllMocks();
  search = '';
  actions.getPropertyUnitsAction.mockResolvedValue({
    units: [unit(11, '126', 'Casa', { residentsCount: 2, mainResidentName: 'Ana Pérez' }), unit(12, '4', 'Dúplex', { residentsCount: 0 })],
    total: 194,
    page: 1,
    pageSize: 10,
    totalPages: 20,
  });
  actions.getPropertyUnitsSummaryAction.mockResolvedValue(summary);
});

describe('U1 · Unidades', () => {
  it('muestra "Casa 126" (nunca el id), el coeficiente, la ocupación y el resumen', async () => {
    render(<PropertyUnitsTable businessId={1} />);
    const table = await screen.findByRole('table', { name: 'Unidades' });
    expect(await within(table).findByText('Casa 126')).toBeInTheDocument();
    expect(within(table).getByText('Dúplex 4')).toBeInTheDocument();
    expect(within(table).getAllByText('0,503')).toHaveLength(2);
    expect(within(table).getByText('Ana Pérez +1')).toBeInTheDocument();
    expect(within(table).getByText('Sin residentes')).toBeInTheDocument();
    expect(within(table).queryByText('11')).not.toBeInTheDocument();
    expect(await screen.findByText('Suman 100')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Unidades/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('los chips por bloque filtran por la URL y la lista pide ese bloque', async () => {
    render(<PropertyUnitsTable businessId={1} />);
    const chips = await screen.findByRole('group', { name: 'Filtrar por bloque' });
    await userEvent.click(await within(chips).findByRole('button', { name: /^Casa/ }));
    expect(lastQuery().get('bloque')).toBe('Casa');

    search = 'bloque=Casa&page=2';
    render(<PropertyUnitsTable businessId={1} />);
    await waitFor(() =>
      expect(actions.getPropertyUnitsAction).toHaveBeenLastCalledWith(expect.objectContaining({ businessId: 1, block: 'Casa', page: 2 })),
    );
  });

  it('la vista "Por bloque" suma coeficientes por bloque y abre la lista filtrada', async () => {
    search = 'vista=bloques';
    render(<PropertyUnitsTable businessId={1} />);
    const table = await screen.findByRole('table', { name: 'Unidades por bloque' });
    expect(await within(table).findByText('78,568')).toBeInTheDocument();
    expect(within(table).getByText('15,331')).toBeInTheDocument();
    await userEvent.click(within(table).getByText('Local'));
    const q = lastQuery();
    expect(q.get('bloque')).toBe('Local');
    expect(q.get('vista')).toBeNull();
  });

  it('eliminar pide confirmación y llama la acción con la unidad', async () => {
    actions.deletePropertyUnitAction.mockResolvedValue(undefined);
    render(<PropertyUnitsTable businessId={1} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Acciones de Casa 126' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Eliminar' }));
    const dialog = screen.getByRole('dialog', { name: '¿Eliminar Casa 126?' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(actions.deletePropertyUnitAction).toHaveBeenCalledWith({ businessId: 1, unitId: 11, token: 'T' }));
    expect(await screen.findByText('Casa 126 eliminada')).toBeInTheDocument();
  });

  it('crear unidad envía el coeficiente desde el modal de 560 px', async () => {
    actions.createPropertyUnitAction.mockResolvedValue(unit(13, '200', 'Casa'));
    render(<PropertyUnitsTable businessId={1} />);
    await userEvent.click(await screen.findByRole('button', { name: '+ Nueva unidad' }));
    const dialog = screen.getByRole('dialog', { name: 'Crear unidad' });
    await userEvent.type(within(dialog).getByLabelText('Número *'), '200');
    await userEvent.type(within(dialog).getByLabelText('Bloque / torre'), 'Casa');
    await userEvent.type(within(dialog).getByLabelText('Coeficiente de copropiedad'), '0,45');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear unidad' }));
    await waitFor(() =>
      expect(actions.createPropertyUnitAction).toHaveBeenCalledWith(
        expect.objectContaining({ businessId: 1, data: expect.objectContaining({ number: '200', block: 'Casa', coefficient: 0.45 }) }),
      ),
    );
  });
});
