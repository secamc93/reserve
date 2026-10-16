import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VisitListDTO } from '../domain';

const replace = vi.fn();
let search = '';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace }),
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
}));
vi.mock('../infrastructure/actions', () => actions);
vi.mock('@/services/modules/horizontal-properties/units/infrastructure/actions', () => ({
  getPropertyUnitsAction: vi.fn().mockResolvedValue({ units: [{ id: 40, number: '126', block: 'Casa', isActive: true }] }),
}));

import { VisitsTable } from './visits-table';

const row = (over: Partial<VisitListDTO>): VisitListDTO => ({
  id: 1,
  visitorName: 'Laura Gómez',
  visitorDni: '52123456',
  propertyUnitNumber: '126',
  propertyUnitBlock: 'Casa',
  visitTypeName: 'Familiar',
  visitStatusName: 'Autorizada',
  visitStatusCode: 'authorized',
  scheduledDate: '2026-10-15T00:00:00Z',
  scheduledStartTime: '2026-10-15T09:00:00Z',
  numberOfVisitors: 2,
  createdAt: '2026-10-14T20:00:00Z',
  ...over,
});

const rows = [
  row({ id: 1 }),
  row({ id: 2, visitorName: 'Pedro Ruiz', propertyUnitNumber: '8', propertyUnitBlock: 'Dúplex', visitStatusCode: 'in_progress', actualEntryTime: '2026-10-15T14:00:00Z' }),
  row({ id: 3, visitorName: 'Ana Díaz', visitStatusCode: 'completed', actualEntryTime: '2026-10-15T13:00:00Z', actualExitTime: '2026-10-15T15:00:00Z' }),
];

beforeEach(() => {
  vi.clearAllMocks();
  search = '';
  actions.getVisitsAction.mockResolvedValue({ visits: rows, total: 3, page: 1, pageSize: 10, totalPages: 1 });
  actions.getVisitsSummaryAction.mockResolvedValue({ date: '2026-10-15', inside: 1, expected: 1, left: 1, cancelled: 0, total: 3, insideNow: 2 });
  actions.getVisitByIdAction.mockResolvedValue({
    id: 1,
    propertyUnitId: 40,
    visitTypeId: 2,
    scheduledDate: '2026-10-15T00:00:00Z',
    scheduledStartTime: '2026-10-15T09:00:00Z',
    authorizationCode: 'AUTH-1',
    numberOfVisitors: 2,
    hasCompanions: false,
    hasAssets: false,
    notifyResident: true,
    notifySecurity: false,
    createdAt: '2026-10-14T20:00:00Z',
  });
});

describe('Visitas de hoy (V1)', () => {
  it('lista las visitas del día con "Casa 126", estado y conteos por estado', async () => {
    render(<VisitsTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Visitas' });
    expect(await within(table).findByText('Laura Gómez')).toBeInTheDocument();
    expect(within(table).getAllByText('Casa 126').length).toBeGreaterThan(0);
    expect(within(table).getByText('Dúplex 8')).toBeInTheDocument();
    expect(within(table).getByText('Dentro')).toBeInTheDocument();
    expect(within(table).getByText('Salió')).toBeInTheDocument();

    const chips = screen.getByRole('group', { name: 'Estado de la visita' });
    expect(await within(chips).findByRole('button', { name: /Dentro\s*·\s*1/ })).toBeInTheDocument();
    expect(within(chips).getByRole('button', { name: /Todas\s*·\s*3/ })).toHaveAttribute('aria-pressed', 'true');
    expect(await screen.findByText('2 dentro ahora')).toBeInTheDocument();

    // Consulta solo el día de hoy, con el negocio de la propiedad
    const params = actions.getVisitsAction.mock.calls[0][0];
    expect(params).toMatchObject({ businessId: 7, token: 'T', page: 1, pageSize: 10 });
    expect(params.startDate).toBe(params.endDate);
  });

  it('el chip de estado filtra por la URL y vuelve a la página 1', async () => {
    search = 'page=2';
    render(<VisitsTable businessId={7} />);
    const chips = await screen.findByRole('group', { name: 'Estado de la visita' });
    await userEvent.click(within(chips).getByRole('button', { name: /Esperadas/ }));
    const href = replace.mock.calls.at(-1)?.[0] as string;
    const qs = new URLSearchParams(href.split('?')[1]);
    expect(qs.get('state')).toBe('expected');
    expect(qs.get('page')).toBeNull();
  });

  it('registra la entrada desde la fila y recarga', async () => {
    actions.registerEntryAction.mockResolvedValue({});
    render(<VisitsTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Visitas' });
    await userEvent.click(await within(table).findByRole('button', { name: 'Registrar entrada de Laura Gómez' }));
    await waitFor(() =>
      expect(actions.registerEntryAction).toHaveBeenCalledWith({ businessId: 7, visitId: 1, data: { gate: 'Principal', method: 'manual' }, token: 'T' }),
    );
    expect(await screen.findByText(/Entrada de Laura Gómez registrada/)).toBeInTheDocument();
    expect(actions.getVisitsAction).toHaveBeenCalledTimes(2);
  });

  it('la salida solo aparece para quien está dentro', async () => {
    render(<VisitsTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Visitas' });
    expect(await within(table).findByRole('button', { name: 'Registrar salida de Pedro Ruiz' })).toBeInTheDocument();
    expect(within(table).queryByRole('button', { name: /de Ana Díaz/ })).toBeNull();
  });
});

describe('Detalle de visita (V3)', () => {
  it('al tocar la fila abre el panel con la línea de tiempo, la acción y el enlace a parqueadero', async () => {
    render(<VisitsTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Visitas' });
    await userEvent.click(await within(table).findByText('Laura Gómez'));

    const panel = await screen.findByRole('dialog', { name: 'Laura Gómez' });
    expect(within(panel).getByText('Visita · Casa 126')).toBeInTheDocument();
    const timeline = within(panel).getByRole('region', { name: 'Línea de tiempo' });
    expect(within(timeline).getByText('Programada')).toBeInTheDocument();
    expect(within(timeline).getByText('Entrada')).toBeInTheDocument();
    expect(await within(panel).findByText('AUTH-1')).toBeInTheDocument();
    expect(within(panel).getByRole('link', { name: /Reservar parqueadero/ })).toHaveAttribute(
      'href',
      '/properties/7/parking?tab=reservations&visit_id=1',
    );
    expect(within(panel).getByRole('button', { name: 'Registrar entrada' })).toBeInTheDocument();
  });

  it('cancelar pide confirmación y llama a la acción', async () => {
    actions.deleteVisitAction.mockResolvedValue(undefined);
    render(<VisitsTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Visitas' });
    await userEvent.click(await within(table).findByText('Laura Gómez'));
    const panel = await screen.findByRole('dialog', { name: 'Laura Gómez' });
    await userEvent.click(within(panel).getByRole('button', { name: 'Cancelar visita' }));
    const confirm = await screen.findByRole('dialog', { name: /¿Cancelar la visita de Laura Gómez\?/ });
    expect(actions.deleteVisitAction).not.toHaveBeenCalled();
    await userEvent.click(within(confirm).getByRole('button', { name: 'Sí, cancelar' }));
    await waitFor(() => expect(actions.deleteVisitAction).toHaveBeenCalledWith({ businessId: 7, visitId: 1, token: 'T' }));
  });
});

describe('Nueva visita (V2)', () => {
  it('si el documento no existe pide nombre y teléfono, y crea el visitante y la visita', async () => {
    actions.getVisitTypesAction.mockResolvedValue([{ id: 2, name: 'Familiar', isActive: true }]);
    actions.searchVisitorAction.mockRejectedValue(new Error('no encontrado'));
    actions.createVisitorAction.mockResolvedValue({ id: 55, fullName: 'Carlos Pérez', dni: '1010' });
    actions.createVisitAction.mockResolvedValue({ id: 9 });
    render(<VisitsTable businessId={7} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Nueva visita' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nueva visita' });
    await userEvent.type(within(dialog).getByLabelText(/Documento/), '1010');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Buscar' }));
    expect(await within(dialog).findByText(/No hay un visitante con ese documento/)).toBeInTheDocument();
    await userEvent.type(within(dialog).getByLabelText(/Nombre completo/), 'Carlos Pérez');
    await userEvent.type(within(dialog).getByLabelText(/Teléfono/), '3110000000');

    // Sin unidad no deja guardar
    await userEvent.click(within(dialog).getByRole('button', { name: 'Registrar visita' }));
    expect(await within(dialog).findByText('Elige la unidad que visita')).toBeInTheDocument();
    expect(actions.createVisitorAction).not.toHaveBeenCalled();

    await userEvent.click(await within(dialog).findByRole('combobox', { name: /Unidad/ }));
    await userEvent.click(await within(dialog).findByRole('option', { name: 'Casa 126' }));
    await waitFor(() => expect(within(dialog).getByLabelText(/Tipo/)).toHaveValue('2'));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Registrar visita' }));

    await waitFor(() => expect(actions.createVisitAction).toHaveBeenCalled());
    expect(actions.createVisitorAction.mock.calls[0][0]).toMatchObject({ businessId: 7, data: { dni: '1010', fullName: 'Carlos Pérez', phone: '3110000000' } });
    expect(actions.createVisitAction.mock.calls[0][0]).toMatchObject({ businessId: 7, data: { visitorId: 55, propertyUnitId: 40, visitTypeId: 2 } });
    expect(await screen.findByText('Visita de Carlos Pérez registrada')).toBeInTheDocument();
  });
});
