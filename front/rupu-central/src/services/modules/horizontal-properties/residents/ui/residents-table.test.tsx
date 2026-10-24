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
  getResidentOverviewAction: vi.fn(),
  deleteResidentAction: vi.fn(),
  createResidentAction: vi.fn(),
  updateResidentAction: vi.fn(),
  importResidentsFromExcelAction: vi.fn(),
}));
const unitActions = vi.hoisted(() => ({
  getPropertyUnitsAction: vi.fn(),
  getPropertyUnitsSummaryAction: vi.fn(),
}));
vi.mock('../infrastructure/actions', () => actions);
vi.mock('../infrastructure/actions/bulk-update-residents.action', () => ({ bulkUpdateResidentsAction: vi.fn() }));
vi.mock('../../units/infrastructure/actions', () => unitActions);

import { ResidentsTable } from './residents-table';

const row = (id: number, extra: object = {}) => ({
  id, businessId: 0, propertyUnitId: 0, propertyUnitNumber: '126', propertyUnitBlock: 'Casa', residentTypeId: 0,
  residentTypeName: 'Propietario', residentTypeCode: '', name: 'Ana Pérez', email: 'ana@correo.co', phone: '3001234567',
  dni: '52123', isMainResident: true, isActive: true, since: '2021-03-01T00:00:00Z', createdAt: '', updatedAt: '', ...extra,
});

const lastQuery = () => new URLSearchParams(String(replace.mock.calls.at(-1)?.[0]).split('?')[1] ?? '');

beforeEach(() => {
  vi.clearAllMocks();
  search = '';
  actions.getResidentsAction.mockResolvedValue({
    residents: [row(5), row(6, { name: 'Luis Gómez', email: '', isMainResident: false, residentTypeName: 'Familiar', isActive: false })],
    total: 2, page: 1, pageSize: 10, totalPages: 1,
  });
  actions.getResidentsSummaryAction.mockResolvedValue({
    total: 214, active: 210, inactive: 4, main: 194, withoutEmail: 31,
    types: [
      { id: 7, name: 'Propietario', code: 'owner', total: 150 },
      { id: 8, name: 'Arrendatario', code: 'tenant', total: 50 },
      { id: 9, name: 'Familiar', code: 'family', total: 14 },
    ],
  });
  unitActions.getPropertyUnitsSummaryAction.mockResolvedValue({
    total: 194, active: 194, withResidents: 190, coefficientSum: 100, commercial: 0,
    blocks: [{ block: 'Casa', total: 156, active: 156, coefficientSum: 79.41 }, { block: 'Local', total: 25, active: 25, coefficientSum: 14.4 }],
  });
  unitActions.getPropertyUnitsAction.mockResolvedValue({
    units: [{ id: 3, businessId: 1, number: '126', block: 'Casa', unitType: 'house', isActive: true, createdAt: '', updatedAt: '', residentsCount: 2 }],
    total: 1, page: 1, pageSize: 20, totalPages: 1,
  });
  actions.getResidentByIdAction.mockResolvedValue({ ...row(5), businessId: 1, propertyUnitId: 3, residentTypeId: 7, emergencyContact: 'Luis 300' });
  actions.getResidentOverviewAction.mockResolvedValue({
    stats: { visits30d: 3, packagesPending: 2, reservations: 1, votesCast: 4, votesTotal: 4 },
    housemates: [{ id: 6, name: 'Luis Gómez', typeName: 'Familiar', isMain: false }],
    activity: [{ kind: 'package', title: 'Paquete recibido', subtitle: 'Servientrega', at: '2026-10-12T10:00:00Z' }],
  });
});

describe('R1 · Residentes', () => {
  it('pestañas del diseño, columnas con avatar, PRINCIPAL, contacto y "desde"', async () => {
    render(<ResidentsTable businessId={1} />);
    const tabs = await screen.findByRole('tablist', { name: 'Residentes por tipo' });
    await waitFor(() => expect(within(tabs).getAllByRole('tab').map((t) => t.textContent?.replace(/ /g, ' '))).toEqual([
      'Todos · 214', 'Propietarios · 150', 'Arrendatarios · 50', 'Familiares · 14', 'Sin correo · 31', 'Inactivos · 4',
    ]));
    const table = screen.getByRole('table', { name: 'Residentes' });
    const ana = (await within(table).findByText('Ana Pérez')).closest('[role="row"]') as HTMLElement;
    expect(within(ana).getByText('PRINCIPAL')).toBeInTheDocument();
    expect(within(ana).getByText('52123')).toBeInTheDocument();
    expect(within(ana).getByText('Casa 126')).toBeInTheDocument();
    expect(within(ana).getByText('mar 2021')).toBeInTheDocument();
    const luis = within(table).getByText('Luis Gómez').closest('[role="row"]') as HTMLElement;
    expect(within(luis).getByText('sin correo')).toBeInTheDocument();
    expect(within(luis).getByText('Inactivo')).toBeInTheDocument();
  });

  it('pestaña por tipo, torre y búsqueda viajan a la URL y al back', async () => {
    render(<ResidentsTable businessId={1} />);
    await userEvent.click(await screen.findByRole('tab', { name: /^Arrendatarios/ }));
    expect(lastQuery().get('pestana')).toBe('tipo:8');
    await userEvent.selectOptions(await screen.findByRole('combobox', { name: 'Torre' }), 'Casa');
    expect(lastQuery().get('torre')).toBe('Casa');

    search = 'pestana=sin-correo&torre=Casa&q=126';
    render(<ResidentsTable businessId={1} />);
    await waitFor(() =>
      expect(actions.getResidentsAction).toHaveBeenLastCalledWith(expect.objectContaining({ withoutEmail: true, block: 'Casa', query: '126' })),
    );
  });

  it('R4 · clic en la fila abre el detalle con cifras, la unidad y la actividad', async () => {
    render(<ResidentsTable businessId={1} />);
    const table = await screen.findByRole('table', { name: 'Residentes' });
    await userEvent.click(await within(table).findByText('Ana Pérez'));
    const panel = await screen.findByRole('dialog', { name: 'Ana Pérez' });
    expect(within(panel).getByText('Residente · Casa 126')).toBeInTheDocument();
    expect(within(panel).getByText('Propietario · CC 52123 · desde mar 2021')).toBeInTheDocument();
    expect(await within(panel).findByText('4/4')).toBeInTheDocument();
    expect(within(panel).getByText('Paquete recibido')).toBeInTheDocument();
    expect(within(panel).getByText('Luis Gómez')).toBeInTheDocument();
    expect(within(panel).getByRole('link', { name: 'Recibir paquete' })).toHaveAttribute('href', '/properties/1/packages');
    expect(actions.getResidentOverviewAction).toHaveBeenCalledWith({ businessId: 1, residentId: 5, token: 'T' });

    await userEvent.click(within(panel).getByRole('button', { name: 'Editar' }));
    expect(await screen.findByRole('dialog', { name: 'Editar Ana Pérez' })).toBeInTheDocument();
  });

  it('R2 · el contrato de arrendamiento aparece solo para arrendatarios', async () => {
    actions.createResidentAction.mockResolvedValue(row(9));
    render(<ResidentsTable businessId={1} />);
    await screen.findByRole('tab', { name: /^Arrendatarios/ });
    await userEvent.click(screen.getByRole('button', { name: '+ Nuevo residente' }));
    const dialog = screen.getByRole('dialog', { name: 'Nuevo residente' });
    expect(within(dialog).queryByRole('group', { name: 'Contrato de arrendamiento' })).not.toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('radio', { name: 'Arrendatario' }));
    expect(within(dialog).getByRole('group', { name: 'Contrato de arrendamiento' })).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear residente' }));
    expect(within(dialog).getByText('Elige una unidad de la lista')).toBeInTheDocument();
    expect(actions.createResidentAction).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole('combobox', { name: 'Unidad *' }));
    await userEvent.click(await within(dialog).findByRole('option', { name: /Casa 126/ }));
    expect(within(dialog).getByText('2 residentes actuales')).toBeInTheDocument();
    await userEvent.type(within(dialog).getByLabelText('Nombre completo *'), 'Eva Ruiz');
    await userEvent.type(within(dialog).getByLabelText('Documento *'), '777');
    await userEvent.type(within(dialog).getByLabelText('Correo *'), 'eva@correo.co');
    await userEvent.type(within(dialog).getByLabelText('Canon (COP)'), '1500000');
    await userEvent.click(within(dialog).getByRole('checkbox', { name: 'Residente principal de la unidad' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear residente' }));
    await waitFor(() =>
      expect(actions.createResidentAction).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ propertyUnitId: 3, residentTypeId: 8, name: 'Eva Ruiz', monthlyRent: 1500000, isMainResident: true }) }),
      ),
    );
  });

  it('R3 · edición masiva: marca cambios, valida correos y guarda solo lo cambiado', async () => {
    actions.updateResidentAction.mockResolvedValue(row(5));
    render(<ResidentsTable businessId={1} />);
    await screen.findByRole('tab', { name: /^Arrendatarios/ });
    await userEvent.click(screen.getByRole('button', { name: 'Edición masiva' }));
    const dialog = await screen.findByRole('dialog', { name: '1 unidad · 2 residentes' });
    expect(within(dialog).getByText(/Edición masiva · Casa/i)).toBeInTheDocument();
    await waitFor(() => expect(actions.getResidentsAction).toHaveBeenLastCalledWith(expect.objectContaining({ block: 'Casa', pageSize: 200 })));

    const email = within(dialog).getByLabelText('Correo de Luis Gómez');
    await userEvent.type(email, 'luis@');
    expect(within(dialog).getByText('1 cambio sin guardar · 1 correo inválido')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Guardar cambios' })).toBeDisabled();
    await userEvent.type(email, 'correo.co');
    await userEvent.click(within(dialog).getByRole('radio', { name: 'Principal de Casa 126: Luis Gómez' }));
    expect(within(dialog).getByText('3 cambios sin guardar')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(actions.updateResidentAction).toHaveBeenCalledTimes(2));
    expect(actions.updateResidentAction).toHaveBeenCalledWith({ businessId: 1, residentId: 5, token: 'T', data: { isMainResident: false } });
    expect(actions.updateResidentAction).toHaveBeenCalledWith({ businessId: 1, residentId: 6, token: 'T', data: { email: 'luis@correo.co', isMainResident: true } });
  });

  it('importar Excel ofrece descargar la plantilla de ejemplo', async () => {
    render(<ResidentsTable businessId={1} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Importar Excel' }));
    const dialog = screen.getByRole('dialog', { name: 'Importar residentes desde Excel' });
    const link = within(dialog).getByRole('link', { name: /Descargar Excel de ejemplo/ });
    expect(link).toHaveAttribute('href', '/plantillas/plantilla-residentes.xlsx');
    expect(link).toHaveAttribute('download');
  });
});
