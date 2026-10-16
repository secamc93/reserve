import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const replace = vi.fn();
let search = '';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => '/properties/1/residents',
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'f-sans', className: 'f-sans' }),
  JetBrains_Mono: () => ({ variable: 'f-mono', className: 'f-mono' }),
}));
vi.mock('@shared/config', () => ({
  TokenStorage: { getBusinessToken: () => 'T', getActiveBusiness: () => 1 },
}));

const actions = vi.hoisted(() => ({
  getResidentsAction: vi.fn(),
  getResidentsSummaryAction: vi.fn(),
  getResidentByIdAction: vi.fn(),
  deleteResidentAction: vi.fn(),
  createResidentAction: vi.fn(),
  updateResidentAction: vi.fn(),
  importResidentsFromExcelAction: vi.fn(),
}));
vi.mock('../infrastructure/actions', () => actions);
vi.mock('../infrastructure/actions/bulk-update-residents.action', () => ({ bulkUpdateResidentsAction: vi.fn() }));
vi.mock('../../units/infrastructure/actions', () => ({ getPropertyUnitsAction: vi.fn().mockResolvedValue({ units: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }) }));

import { ResidentsTable } from './residents-table';

const row = {
  id: 5, businessId: 0, propertyUnitId: 0, propertyUnitNumber: '126', propertyUnitBlock: 'Casa', residentTypeId: 0,
  residentTypeName: 'Arrendatario', residentTypeCode: '', name: 'Ana Pérez', email: 'ana@correo.co', phone: '3001234567',
  dni: '123', isMainResident: true, isActive: true, createdAt: '', updatedAt: '',
};

const lastQuery = () => new URLSearchParams(String(replace.mock.calls.at(-1)?.[0]).split('?')[1] ?? '');

beforeEach(() => {
  vi.clearAllMocks();
  search = '';
  actions.getResidentsAction.mockResolvedValue({ residents: [row], total: 1, page: 1, pageSize: 10, totalPages: 1 });
  actions.getResidentsSummaryAction.mockResolvedValue({
    total: 194, active: 190, inactive: 4, main: 194,
    types: [
      { id: 7, name: 'Propietario', code: 'owner', total: 150 },
      { id: 8, name: 'Arrendatario', code: 'tenant', total: 44 },
    ],
  });
  actions.getResidentByIdAction.mockResolvedValue({
    ...row, businessId: 1, propertyUnitId: 3, residentTypeId: 8, emergencyContact: 'Luis 300',
    moveInDate: '2024-02-01T00:00:00Z', createdAt: '2024-01-10T15:00:00Z', updatedAt: '2024-01-10T15:00:00Z',
  });
});

describe('R1 · Residentes', () => {
  it('muestra la unidad como "Casa 126", el documento y los chips por tipo con ids reales', async () => {
    render(<ResidentsTable businessId={1} />);
    const table = await screen.findByRole('table', { name: 'Residentes' });
    expect(await within(table).findByText('Casa 126')).toBeInTheDocument();
    expect(within(table).getByText('123')).toBeInTheDocument();
    const chips = screen.getByRole('group', { name: 'Filtrar por tipo' });
    await userEvent.click(await within(chips).findByRole('button', { name: /^Arrendatarios/ }));
    expect(lastQuery().get('tipo')).toBe('8');
  });

  it('la búsqueda por unidad y el estado viajan al back', async () => {
    search = 'campo=unit&q=126&estado=inactivos';
    render(<ResidentsTable businessId={1} />);
    await waitFor(() =>
      expect(actions.getResidentsAction).toHaveBeenLastCalledWith(
        expect.objectContaining({ propertyUnitNumber: '126', isActive: false }),
      ),
    );
    expect(screen.getByRole('tab', { name: /Inactivos/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('R3 · clic en la fila abre el panel lateral con contacto y línea de tiempo', async () => {
    render(<ResidentsTable businessId={1} />);
    const table = await screen.findByRole('table', { name: 'Residentes' });
    await userEvent.click(await within(table).findByText('Ana Pérez'));
    const panel = await screen.findByRole('dialog', { name: 'Ana Pérez' });
    expect(within(panel).getByText('Residente · Casa 126')).toBeInTheDocument();
    expect(await within(panel).findByText('Luis 300')).toBeInTheDocument();
    expect(within(panel).getByRole('list', { name: 'Línea de tiempo' })).toBeInTheDocument();
    expect(within(panel).getByText('Ingreso a la unidad')).toBeInTheDocument();
    expect(actions.getResidentByIdAction).toHaveBeenCalledWith({ businessId: 1, residentId: 5, token: 'T' });

    await userEvent.click(within(panel).getByRole('button', { name: 'Editar' }));
    // El formulario de edición (modal 560) se abre sobre el panel con los datos del detalle.
    expect(await screen.findByText('Editar residente')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('Luis 300')).toBeInTheDocument();
    expect(screen.getByLabelText('Unidad *')).toHaveValue('Casa 126');
  });

  it('R2 · crear valida los campos obligatorios antes de enviar', async () => {
    render(<ResidentsTable businessId={1} />);
    await userEvent.click(await screen.findByRole('button', { name: '+ Nuevo residente' }));
    const dialog = screen.getByRole('dialog', { name: 'Agregar residente' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Agregar residente' }));
    expect(within(dialog).getByText('Elige una unidad de la lista')).toBeInTheDocument();
    expect(within(dialog).getByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(actions.createResidentAction).not.toHaveBeenCalled();
    // Tipos del catálogo real (ids del resumen)
    expect(within(dialog).getByLabelText('Tipo *')).toHaveValue('7');
  });
});
