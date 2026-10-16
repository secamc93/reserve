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
  previewUnitsImportAction: vi.fn(),
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
  commercial: 0,
  blocks: [
    { block: 'Casa', total: 156, active: 156, coefficientSum: 79.41 },
    { block: 'Dúplex', total: 12, active: 12, coefficientSum: 6.101 },
    { block: 'Jardín', total: 1, active: 1, coefficientSum: 0 },
    { block: 'Local', total: 25, active: 25, coefficientSum: 14.489 },
  ],
};

/** Query de la última navegación con replace. */
const lastQuery = () => new URLSearchParams(String(replace.mock.calls.at(-1)?.[0]).split('?')[1] ?? '');

beforeEach(() => {
  vi.clearAllMocks();
  search = '';
  actions.getPropertyUnitsAction.mockResolvedValue({
    units: [
      unit(11, '126', 'Casa', { residentsCount: 2, mainResidentName: 'Ana Pérez', area: 72.5, bedrooms: 3, bathrooms: 2, coefficient: 0.842 }),
      unit(12, '127', 'Casa', { residentsCount: 0 }),
      unit(13, '4', 'Dúplex', { residentsCount: 1, mainResidentName: 'Luis Gómez' }),
    ],
    total: 194,
    page: 1,
    pageSize: 10,
    totalPages: 20,
  });
  actions.getPropertyUnitsSummaryAction.mockResolvedValue(summary);
});

describe('U1 · Unidades por torre/bloque', () => {
  it('pestañas por bloque con conteo, filas agrupadas con el coeficiente del bloque y columnas del diseño', async () => {
    render(<PropertyUnitsTable businessId={1} />);
    const tabs = await screen.findByRole('tablist', { name: 'Unidades por bloque' });
    await waitFor(() => expect(within(tabs).getAllByRole('tab').map((t) => t.textContent?.replace(/ /g, ' '))).toEqual([
      'Todas · 194', 'Casa · 156', 'Local · 25', 'Dúplex · 12', 'Jardín · 1', 'Sin residente · 4',
    ]));

    const table = screen.getByRole('table', { name: 'Unidades' });
    const casa = await within(table).findByRole('rowgroup', { name: 'Casa · 156 unidades' });
    expect(within(casa).getByText('coef. 79,410 %')).toBeInTheDocument();
    expect(within(casa).getByText('Casa 126')).toBeInTheDocument();
    expect(within(casa).getByText('72,5 m²')).toBeInTheDocument();
    expect(within(casa).getByText('3 / 2')).toBeInTheDocument();
    expect(within(casa).getByText('0,842')).toBeInTheDocument();
    expect(within(casa).getByText('Ana Pérez +1')).toBeInTheDocument();
    expect(within(casa).getByText('Sin residente')).toBeInTheDocument();
    expect(within(table).getByRole('rowgroup', { name: 'Dúplex · 12 unidades' })).toBeInTheDocument();
    expect(actions.getPropertyUnitsAction).toHaveBeenCalledWith(expect.objectContaining({ groupByBlock: true }));
  });

  it('la pestaña de bloque y la búsqueda van a la URL y al back', async () => {
    render(<PropertyUnitsTable businessId={1} />);
    await userEvent.click(await screen.findByRole('tab', { name: /^Casa/ }));
    expect(lastQuery().get('pestana')).toBe('bloque:Casa');

    search = 'pestana=sin-residente&q=ana&page=2';
    render(<PropertyUnitsTable businessId={1} />);
    await waitFor(() =>
      expect(actions.getPropertyUnitsAction).toHaveBeenLastCalledWith(expect.objectContaining({ withoutResidents: true, query: 'ana', page: 2 })),
    );
  });

  it('editar desde el lápiz: título "Editar Casa 126", tipo en chips y suma de la propiedad', async () => {
    actions.updatePropertyUnitAction.mockResolvedValue(unit(11, '126', 'Casa'));
    render(<PropertyUnitsTable businessId={1} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Editar Casa 126' }));
    const dialog = screen.getByRole('dialog', { name: 'Editar Casa 126' });
    expect(within(dialog).getByRole('radio', { name: 'Casa' })).toHaveAttribute('aria-checked', 'true');
    expect(within(dialog).getByTestId('coef-sum')).toHaveTextContent('100,000 %');

    const coef = within(dialog).getByLabelText('Coeficiente de copropiedad');
    await userEvent.clear(coef);
    await userEvent.type(coef, '0,9');
    expect(within(dialog).getByTestId('coef-sum')).toHaveTextContent('100,058 %');

    await userEvent.click(within(dialog).getByRole('radio', { name: 'Local' }));
    await userEvent.click(within(dialog).getByRole('switch', { name: 'Activa' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar' }));
    await waitFor(() =>
      expect(actions.updatePropertyUnitAction).toHaveBeenCalledWith(
        expect.objectContaining({ unitId: 11, data: expect.objectContaining({ coefficient: 0.9, unitType: 'commercial', isActive: false }) }),
      ),
    );
  });

  it('eliminar desde el formulario pide confirmación', async () => {
    actions.deletePropertyUnitAction.mockResolvedValue(undefined);
    render(<PropertyUnitsTable businessId={1} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Editar Casa 126' }));
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar unidad' }));
    const confirm = screen.getByRole('dialog', { name: '¿Eliminar Casa 126?' });
    await userEvent.click(within(confirm).getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(actions.deletePropertyUnitAction).toHaveBeenCalledWith({ businessId: 1, unitId: 11, token: 'T' }));
    expect(await screen.findByText('Casa 126 eliminada')).toBeInTheDocument();
  });

  it('nueva unidad: bloque de la lista, número y coeficiente', async () => {
    actions.createPropertyUnitAction.mockResolvedValue(unit(14, '200', 'Casa'));
    render(<PropertyUnitsTable businessId={1} />);
    await screen.findByRole('tab', { name: /^Casa/ });
    await userEvent.click(screen.getByRole('button', { name: '+ Nueva unidad' }));
    const dialog = screen.getByRole('dialog', { name: 'Nueva unidad' });
    await userEvent.selectOptions(within(dialog).getByLabelText('Torre / bloque'), 'Casa');
    await userEvent.type(within(dialog).getByLabelText('Número *'), '200');
    await userEvent.type(within(dialog).getByLabelText('Coeficiente de copropiedad'), '0,45');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear unidad' }));
    await waitFor(() =>
      expect(actions.createPropertyUnitAction).toHaveBeenCalledWith(
        expect.objectContaining({ businessId: 1, data: expect.objectContaining({ number: '200', block: 'Casa', coefficient: 0.45 }) }),
      ),
    );
  });

  it('U3 · importar revisa el archivo (vista previa) antes de importar', async () => {
    actions.previewUnitsImportAction.mockResolvedValue({
      success: true,
      data: {
        columns: 5, totalRows: 3, ready: 1, existing: 1, errors: 1, coefficientTotal: 99.91,
        rows: [
          { row: 2, number: '200', block: 'Casa', unitType: 'house', coefficient: 0.5, status: 'ready', message: '' },
          { row: 3, number: '126', block: 'Casa', unitType: 'house', coefficient: 0.84, status: 'exists', message: 'Ya existe' },
          { row: 4, number: '201', block: 'Casa', unitType: 'house', status: 'empty_coefficient', message: 'Coeficiente vacío' },
        ],
      },
    });
    actions.importUnitsFromExcelAction.mockResolvedValue({ success: true, data: { total: 3, created: 1, updated: 1, skipped: 1, errors: ['Fila 4 (201): Coeficiente vacío'] } });
    render(<PropertyUnitsTable businessId={1} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Importar Excel' }));
    const dialog = screen.getByRole('dialog', { name: 'Elige el archivo' });
    const file = new File(['x'], 'unidades.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    await userEvent.upload(within(dialog).getByLabelText('Archivo Excel'), file);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Revisar archivo' }));

    const review = await screen.findByRole('dialog', { name: 'Revisa antes de importar' });
    expect(within(review).getByText('99,910 %')).toBeInTheDocument();
    expect(within(review).getByText('faltan 0,09')).toBeInTheDocument();
    expect(within(review).getByText('Ya existe · se actualizará')).toBeInTheDocument();
    expect(within(review).getByText('Coeficiente vacío')).toBeInTheDocument();
    await userEvent.click(within(review).getByRole('checkbox', { name: /Actualizar unidades existentes/ }));
    expect(within(review).getByText('Ya existe · se omitirá')).toBeInTheDocument();
    await userEvent.click(within(review).getByRole('checkbox', { name: /Actualizar unidades existentes/ }));
    await userEvent.click(within(review).getByRole('button', { name: 'Importar 2 unidades' }));
    await waitFor(() => expect(actions.importUnitsFromExcelAction).toHaveBeenCalledWith(expect.objectContaining({ businessId: 1, updateExisting: true })));
    expect(await screen.findByRole('dialog', { name: 'Importación terminada' })).toBeInTheDocument();
  });
});
