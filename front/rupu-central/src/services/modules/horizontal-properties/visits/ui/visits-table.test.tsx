import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VisitListDTO } from '../domain';

const replace = vi.fn();
const push = vi.fn();
let search = '';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => '/properties/7/visits',
  useSearchParams: () => new URLSearchParams(search),
}));
// next/font solo funciona compilado por Next.
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));
// Función estable, como la del hook real (useCallback)
const getToken = vi.hoisted(() => async () => 'T');
vi.mock('./use-business-token', () => ({ useBusinessToken: () => getToken }));

const actions = vi.hoisted(() => ({
  getVisitsAction: vi.fn(),
  getVisitsSummaryAction: vi.fn(),
  getVisitTypesAction: vi.fn(),
  getVisitByIdAction: vi.fn(),
  registerEntryAction: vi.fn(),
  registerExitAction: vi.fn(),
  deleteVisitAction: vi.fn(),
  createVisitAction: vi.fn(),
  createVisitorAction: vi.fn(),
  searchVisitorAction: vi.fn(),
  updateVisitAction: vi.fn(),
  getCompanionsAction: vi.fn(),
  createCompanionAction: vi.fn(),
  deleteCompanionAction: vi.fn(),
  registerAssetsAction: vi.fn(),
  getVisitAssetsAction: vi.fn(),
  createVisitorVehicleAction: vi.fn(),
}));
vi.mock('../infrastructure/actions', () => actions);
vi.mock('@/services/modules/horizontal-properties/residents/infrastructure/actions', () => ({
  getResidentsAction: vi.fn().mockResolvedValue({ residents: [], total: 3 }),
}));
vi.mock('@/services/modules/horizontal-properties/units/infrastructure/actions', () => ({
  getPropertyUnitsAction: vi.fn().mockResolvedValue({ units: [{ id: 40, number: '126', block: 'Casa', isActive: true }] }),
}));

import { VisitsTable } from './visits-table';

const row = (over: Partial<VisitListDTO>): VisitListDTO => ({
  id: 1,
  visitorName: 'Laura Gómez',
  visitorDni: '52123456',
  visitorId: 55,
  propertyUnitId: 40,
  propertyUnitNumber: '126',
  propertyUnitBlock: 'Casa',
  visitTypeName: 'Familiar',
  visitStatusName: 'Autorizada',
  visitStatusCode: 'authorized',
  scheduledDate: '2026-10-15T00:00:00Z',
  scheduledStartTime: '2026-10-15T11:00:00Z',
  numberOfVisitors: 2,
  authorizationCode: '7K2M',
  authorizedByName: 'María López',
  createdAt: '2026-10-14T20:00:00Z',
  ...over,
});

const rows = [
  row({
    id: 2,
    visitorName: 'Pedro Ruiz',
    visitorDni: '79456123',
    visitorVehiclePlate: 'KJM842',
    propertyUnitId: 41,
    propertyUnitNumber: '8',
    propertyUnitBlock: 'Dúplex',
    visitStatusCode: 'in_progress',
    actualEntryTime: '2026-10-15T14:00:00Z',
    exceedsTime: true,
    stayLimitMinutes: 20,
  }),
  row({ id: 1 }),
  row({ id: 3, visitorName: 'Ana Díaz', visitStatusCode: 'completed', actualEntryTime: '2026-10-15T14:02:00Z', actualExitTime: '2026-10-15T14:10:00Z' }),
];

beforeEach(() => {
  vi.clearAllMocks();
  search = '';
  actions.getVisitsAction.mockResolvedValue({ visits: rows, total: 23, page: 1, pageSize: 10, totalPages: 3 });
  actions.getVisitsSummaryAction.mockResolvedValue({
    date: '2026-10-15',
    inside: 5,
    expected: 9,
    left: 7,
    cancelled: 2,
    total: 23,
    insideNow: 7,
    exceeded: 1,
    nextExpectedAt: '2026-10-15T11:00:00Z',
    nextUnitNumber: '126',
    nextUnitBlock: 'Casa',
    avgStayMinutes: 72,
  });
  actions.getVisitTypesAction.mockResolvedValue([
    { id: 2, name: 'Familiar', isActive: true, maxDurationHours: 8, requiresAuthorization: false, requiresAssetsTracking: false, requiresVehicleRegistration: false },
    { id: 3, name: 'Domicilio', isActive: true, defaultDurationMinutes: 20, requiresAuthorization: false, requiresAssetsTracking: false, requiresVehicleRegistration: false },
  ]);
  actions.getVisitByIdAction.mockResolvedValue({
    id: 1,
    propertyUnitId: 40,
    visitTypeId: 2,
    scheduledDate: '2026-10-15T00:00:00Z',
    scheduledStartTime: '2026-10-15T11:00:00Z',
    authorizationCode: '7K2M',
    numberOfVisitors: 2,
    hasCompanions: false,
    hasAssets: false,
    notifyResident: true,
    notifySecurity: false,
    notes: '',
    createdAt: '2026-10-14T20:00:00Z',
  });
  actions.getVisitAssetsAction.mockResolvedValue([{ id: 1, assetName: 'Taladro', assetSerial: 'BX-1', entryRegistered: true, exitRegistered: false }]);
});

describe('Visitas de hoy (V1)', () => {
  it('pestañas con conteos, tarjetas del día y pie "23 visitas hoy"', async () => {
    render(<VisitsTable businessId={7} />);
    const tabs = screen.getByRole('tablist', { name: 'Vistas de visitas' });
    expect(await within(tabs).findByRole('tab', { name: /Hoy\s*·\s*23/ })).toHaveAttribute('aria-selected', 'true');
    for (const name of [/Dentro\s*·\s*7/, /Esperadas\s*·\s*9/, /Salieron\s*·\s*7/, /^Semana$/, /^Todas$/]) {
      expect(within(tabs).getByRole('tab', { name })).toBeInTheDocument();
    }
    const inside = screen.getByRole('region', { name: 'Dentro ahora' });
    expect(within(inside).getByText('1 excede su tiempo')).toBeInTheDocument();
    expect(within(inside).getByText('7')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Esperadas hoy' })).getByText('próxima 11:00 · Casa 126')).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Salieron hoy' })).getByText('promedio 1 h 12')).toBeInTheDocument();
    expect(await screen.findByText('23 visitas hoy')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Escanear QR' })).toBeInTheDocument();
  });

  it('filas: documento con placa, una acción por estado y la que excede en terracota', async () => {
    render(<VisitsTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Visitas' });
    expect(await within(table).findByText('CC 79.456.123 · KJM842')).toBeInTheDocument();
    expect(within(table).getByText('Excede tiempo')).toBeInTheDocument();
    expect(within(table).getByText('Esperada')).toBeInTheDocument();
    expect(within(table).getByText('09:02 → 09:10')).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'Registrar salida de Pedro Ruiz' })).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'Registrar entrada de Laura Gómez' })).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'Ver visita de Ana Díaz' })).toBeInTheDocument();
    expect(within(table).getAllByRole('button', { name: /Más acciones de/ })).toHaveLength(3);
    const exceedRow = within(table).getByText('Pedro Ruiz').closest('[role="row"]') as HTMLElement;
    expect(exceedRow.style.background).toBe('rgb(253, 244, 241)');
  });

  it('la pestaña filtra por la URL y vuelve a la página 1', async () => {
    search = 'page=2';
    render(<VisitsTable businessId={7} />);
    const tabs = screen.getByRole('tablist', { name: 'Vistas de visitas' });
    await userEvent.click(within(tabs).getByRole('tab', { name: /Esperadas/ }));
    const qs = new URLSearchParams((replace.mock.calls.at(-1)?.[0] as string).split('?')[1]);
    expect(qs.get('tab')).toBe('expected');
    expect(qs.get('page')).toBeNull();
  });

  it('pestaña Dentro: consulta los de adentro sin fecha', async () => {
    search = 'tab=inside';
    render(<VisitsTable businessId={7} />);
    await waitFor(() => expect(actions.getVisitsAction).toHaveBeenCalled());
    const params = actions.getVisitsAction.mock.calls[0][0];
    expect(params).toMatchObject({ businessId: 7, state: 'inside' });
    expect(params.startDate).toBeUndefined();
  });

  it('Registrar entrada abre la confirmación con la puerta y la guarda en entry_gate', async () => {
    actions.registerEntryAction.mockResolvedValue({});
    render(<VisitsTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Visitas' });
    await userEvent.click(await within(table).findByRole('button', { name: 'Registrar entrada de Laura Gómez' }));
    const dialog = await screen.findByRole('dialog', { name: 'Laura Gómez' });
    expect(within(dialog).getByText('✓ Autorizada')).toBeInTheDocument();
    expect(within(dialog).getByText('Autorizó María López')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('radio', { name: 'Peatonal 2' }));
    await userEvent.click(within(dialog).getByRole('button', { name: /Confirmar entrada · \d{2}:\d{2}/ }));
    await waitFor(() =>
      expect(actions.registerEntryAction).toHaveBeenCalledWith({ businessId: 7, visitId: 1, data: { gate: 'Peatonal 2', method: 'manual' }, token: 'T' }),
    );
    expect(await screen.findByText(/Entrada de Laura Gómez registrada/)).toBeInTheDocument();
  });

  it('Registrar salida es directa desde la fila', async () => {
    actions.registerExitAction.mockResolvedValue({});
    render(<VisitsTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Visitas' });
    await userEvent.click(await within(table).findByRole('button', { name: 'Registrar salida de Pedro Ruiz' }));
    await waitFor(() => expect(actions.registerExitAction).toHaveBeenCalledWith({ businessId: 7, visitId: 2, data: { gate: 'Principal' }, token: 'T' }));
  });

  it('Escanear QR sin lector busca por código en Todas', async () => {
    render(<VisitsTable businessId={7} />);
    await userEvent.click(screen.getByRole('button', { name: 'Escanear QR' }));
    const dialog = await screen.findByRole('dialog', { name: 'Buscar por código' });
    await userEvent.type(within(dialog).getByLabelText('Código'), '7K2M');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Buscar' }));
    const qs = new URLSearchParams((replace.mock.calls.at(-1)?.[0] as string).split('?')[1]);
    expect(qs.get('tab')).toBe('all');
    expect(qs.get('q')).toBe('7K2M');
  });
});

describe('Detalle de visita (V3)', () => {
  it('cabecera con #id y código, línea de tiempo, autorizó, activos y enlace a parqueadero', async () => {
    render(<VisitsTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Visitas' });
    await userEvent.click(await within(table).findByText('Laura Gómez'));

    const panel = await screen.findByRole('dialog', { name: 'Laura Gómez' });
    expect(within(panel).getByText('Visita #1 · Cód. aut. 7K2M')).toBeInTheDocument();
    expect(within(panel).getByText('LG')).toBeInTheDocument();
    const timeline = within(panel).getByRole('region', { name: 'Línea de tiempo' });
    expect(within(timeline).getByText('autorizó María López')).toBeInTheDocument();
    expect(within(within(panel).getByRole('region', { name: 'Autorizó' })).getByText('María López')).toBeInTheDocument();
    expect(await within(within(panel).getByRole('region', { name: 'Activos declarados' })).findByText('Taladro')).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Registrar entrada' })).toBeInTheDocument();
    expect(within(panel).getByRole('button', { name: 'Imprimir' })).toBeInTheDocument();
    await userEvent.click(within(panel).getByRole('button', { name: /Reservar parqueadero/ }));
    expect(push).toHaveBeenCalledWith('/properties/7/parking?tab=reservations&visit_id=1');
  });

  it('guarda la nota de portería', async () => {
    actions.updateVisitAction.mockResolvedValue({});
    render(<VisitsTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Visitas' });
    await userEvent.click(await within(table).findByText('Laura Gómez'));
    const panel = await screen.findByRole('dialog', { name: 'Laura Gómez' });
    await userEvent.type(await within(panel).findByLabelText('Nota de portería'), 'Dejó la cédula');
    await userEvent.click(within(panel).getByRole('button', { name: 'Guardar nota' }));
    await waitFor(() => expect(actions.updateVisitAction).toHaveBeenCalledWith({ businessId: 7, visitId: 1, data: { notes: 'Dejó la cédula' }, token: 'T' }));
  });

  it('cancelar pide confirmación y llama a la acción', async () => {
    actions.deleteVisitAction.mockResolvedValue(undefined);
    render(<VisitsTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Visitas' });
    await userEvent.click(await within(table).findByText('Laura Gómez'));
    const panel = await screen.findByRole('dialog', { name: 'Laura Gómez' });
    await userEvent.click(within(panel).getByRole('button', { name: /Cancelar visita/ }));
    const confirm = await screen.findByRole('dialog', { name: /¿Cancelar la visita de Laura Gómez\?/ });
    expect(actions.deleteVisitAction).not.toHaveBeenCalled();
    await userEvent.click(within(confirm).getByRole('button', { name: 'Sí, cancelar' }));
    await waitFor(() => expect(actions.deleteVisitAction).toHaveBeenCalledWith({ businessId: 7, visitId: 1, token: 'T' }));
  });
});

describe('Nueva visita en 3 pasos (V2)', () => {
  it('visitante nuevo → unidad y tipo en tarjetas → vehículo; crea visitante, vehículo y visita', async () => {
    actions.searchVisitorAction.mockRejectedValue(new Error('no encontrado'));
    actions.createVisitorAction.mockResolvedValue({ id: 55, fullName: 'Carlos Pérez', dni: '1010' });
    actions.createVisitorVehicleAction.mockResolvedValue({ id: 9, plate: 'KJM842' });
    actions.createVisitAction.mockResolvedValue({ id: 90 });
    render(<VisitsTable businessId={7} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Nueva visita' }));

    const dialog = await screen.findByRole('dialog', { name: '¿Quién viene?' });
    expect(within(dialog).getByText('Nueva visita · Paso 1 de 3')).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Siguiente: unidad →' }));
    expect(await within(dialog).findByText('Busca al visitante por su documento')).toBeInTheDocument();

    await userEvent.type(within(dialog).getByLabelText(/Documento/), '1010');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Buscar' }));
    await userEvent.type(await within(dialog).findByLabelText(/Nombre completo/), 'Carlos Pérez');
    await userEvent.type(within(dialog).getByLabelText(/Teléfono/), '3110000000');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Siguiente: unidad →' }));

    const step2 = await screen.findByRole('dialog', { name: '¿A qué unidad y para qué?' });
    expect(within(step2).getByText('Carlos Pérez')).toBeInTheDocument();
    expect(await within(step2).findByRole('radio', { name: /Domicilio\s*20 min/ })).toBeInTheDocument();
    expect(within(step2).getByRole('radio', { name: /Familiar\s*hasta 8 h/ })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(within(step2).getByRole('combobox', { name: /Unidad/ }));
    await userEvent.click(await within(step2).findByRole('option', { name: 'Casa 126' }));
    expect(await within(step2).findByText('3 residentes')).toBeInTheDocument();
    await userEvent.click(within(step2).getByRole('button', { name: 'Más personas' }));
    await userEvent.click(within(step2).getByLabelText('Trae vehículo'));
    await userEvent.click(within(step2).getByRole('button', { name: 'Siguiente: vehículo →' }));

    const step3 = await screen.findByRole('dialog', { name: '¿Viene en vehículo?' });
    await userEvent.type(within(step3).getByLabelText(/Placa/), 'kjm 842');
    await userEvent.click(within(step3).getByRole('button', { name: 'Guardar visita' }));

    await waitFor(() => expect(actions.createVisitAction).toHaveBeenCalled());
    expect(actions.createVisitorAction.mock.calls[0][0]).toMatchObject({ businessId: 7, data: { dni: '1010', fullName: 'Carlos Pérez', phone: '3110000000' } });
    expect(actions.createVisitorVehicleAction.mock.calls[0][0]).toMatchObject({ businessId: 7, data: { visitorId: 55, plate: 'KJM842' } });
    expect(actions.createVisitAction.mock.calls[0][0]).toMatchObject({ businessId: 7, data: { visitorId: 55, visitorVehicleId: 9, propertyUnitId: 40, visitTypeId: 2, numberOfVisitors: 2 } });
    expect(actions.registerEntryAction).not.toHaveBeenCalled();
    expect(await screen.findByText('Visita de Carlos Pérez registrada')).toBeInTheDocument();
  });

  it('visitante conocido: muestra su historial y sugiere unidades; "Guardar y registrar entrada"', async () => {
    actions.searchVisitorAction.mockResolvedValue({ id: 55, fullName: 'Laura Gómez', dni: '52123456', totalVisits: 4 });
    actions.createVisitAction.mockResolvedValue({ id: 91 });
    actions.registerEntryAction.mockResolvedValue({});
    render(<VisitsTable businessId={7} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Nueva visita' }));
    const dialog = await screen.findByRole('dialog', { name: '¿Quién viene?' });
    await userEvent.type(within(dialog).getByLabelText(/Documento/), '52123456');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Buscar' }));
    expect(await within(dialog).findByText(/visitó 23 veces · última: Dúplex 8/)).toBeInTheDocument();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Siguiente: unidad →' }));

    const step2 = await screen.findByRole('dialog', { name: '¿A qué unidad y para qué?' });
    const suggested = within(step2).getByRole('group', { name: 'Sugerida por historial' });
    await userEvent.click(within(suggested).getByRole('button', { name: 'Dúplex 8' }));
    await waitFor(() => expect(within(step2).getByRole('radio', { name: /Familiar/ })).toHaveAttribute('aria-checked', 'true'));
    await userEvent.click(within(step2).getByRole('button', { name: 'Guardar y registrar entrada' }));
    await waitFor(() => expect(actions.registerEntryAction).toHaveBeenCalledWith({ businessId: 7, visitId: 91, data: { gate: 'Principal', method: 'manual' }, token: 'T' }));
    expect(actions.createVisitAction.mock.calls[0][0].data).toMatchObject({ visitorId: 55, propertyUnitId: 41 });
  });
});
