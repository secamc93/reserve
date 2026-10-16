import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PackageListDTO } from '../domain';

const replace = vi.fn();
let search = '';
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace }),
  usePathname: () => '/properties/7/packages',
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));
// Función estable, como la del hook real (useCallback)
const getToken = vi.hoisted(() => async () => 'T');
vi.mock('./use-business-token', () => ({ useBusinessToken: () => getToken }));

const actions = vi.hoisted(() => ({
  getPackagesAction: vi.fn(),
  getPackagesSummaryAction: vi.fn(),
  getPackageByIdAction: vi.fn(),
  deliverPackageAction: vi.fn(),
  deletePackageAction: vi.fn(),
  receivePackageAction: vi.fn(),
  getPackageStatusesAction: vi.fn(),
}));
vi.mock('../infrastructure/actions', () => actions);
vi.mock('@/services/modules/horizontal-properties/units/infrastructure/actions', () => ({
  getPropertyUnitsAction: vi.fn().mockResolvedValue({ units: [{ id: 40, number: '126', block: 'Casa', isActive: true }] }),
}));
vi.mock('@/services/modules/horizontal-properties/residents/infrastructure/actions', () => ({
  getResidentsAction: vi.fn().mockResolvedValue({
    residents: [
      { id: 70, name: 'María López', residentTypeName: 'Propietaria', dni: '52111222' },
      { id: 71, name: 'Juan López', residentTypeName: 'Familiar', dni: '1010' },
    ],
    total: 2,
  }),
}));

import { PackagesTable } from './packages-table';

const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
const pkg = (over: Partial<PackageListDTO>): PackageListDTO => ({
  id: 1,
  trackingNumber: 'SV-1',
  carrier: 'Servientrega',
  propertyUnitNumber: '126',
  propertyUnitBlock: 'Casa',
  residentName: 'María López',
  description: 'Caja mediana',
  statusName: 'En almacén',
  statusCode: 'in_storage',
  receivedAt: daysAgo(6),
  createdAt: daysAgo(6),
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  search = '';
  actions.getPackagesAction.mockResolvedValue({
    packages: [
      pkg({ id: 1 }),
      pkg({ id: 2, trackingNumber: 'CO-2', carrier: 'Coordinadora', propertyUnitNumber: '8', propertyUnitBlock: 'Dúplex', residentName: '', description: '', statusCode: 'received', receivedAt: new Date().toISOString() }),
    ],
    total: 2,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
  actions.getPackagesSummaryAction.mockResolvedValue({ pending: 12, pendingOverdue: 3, deliveredToday: 5, delivered: 40, closed: 1, total: 53 });
  actions.getPackageByIdAction.mockResolvedValue({ id: 1, propertyUnitId: 40, residentId: 70, statusCode: 'in_storage', receivedByName: 'Carlos Portero', notifyResident: true });
});

describe('Paquetes (P1)', () => {
  it('pestañas con conteos, "Recordar" deshabilitado y columnas con días en portería', async () => {
    render(<PackagesTable businessId={7} />);
    const tabs = screen.getByRole('tablist', { name: 'Vistas de paquetes' });
    expect(await within(tabs).findByRole('tab', { name: /Por entregar\s*·\s*12/ })).toHaveAttribute('aria-selected', 'true');
    expect(within(tabs).getByRole('tab', { name: /Entregados hoy\s*·\s*5/ })).toBeInTheDocument();
    expect(within(tabs).getByRole('tab', { name: /^Todos$/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recordar a residentes' })).toBeDisabled();

    const table = await screen.findByRole('table', { name: 'Paquetes' });
    expect(await within(table).findByText('Casa 126')).toBeInTheDocument();
    expect(within(table).getByText('Caja mediana')).toBeInTheDocument();
    expect(within(table).getByText('SV-1')).toBeInTheDocument();
    const six = within(table).getByText('6 días');
    expect(six).toHaveStyle({ color: '#c8603f' });
    expect(within(table).getByText('hoy')).toBeInTheDocument();
    expect(within(table).getAllByRole('button', { name: /Entregar paquete de/ })).toHaveLength(2);
    expect(within(table).getAllByRole('button', { name: /Más acciones del paquete/ })).toHaveLength(2);
    expect(actions.getPackagesAction.mock.calls[0][0]).toMatchObject({ businessId: 7, statusGroup: 'pending', page: 1 });
  });

  it('"Entregados hoy" consulta los entregados de hoy', async () => {
    search = 'tab=today';
    render(<PackagesTable businessId={7} />);
    await waitFor(() => expect(actions.getPackagesAction).toHaveBeenCalled());
    expect(actions.getPackagesAction.mock.calls[0][0]).toMatchObject({ statusGroup: 'delivered', deliveredToday: true });
  });

  it('la pestaña cambia la URL', async () => {
    render(<PackagesTable businessId={7} />);
    const tabs = screen.getByRole('tablist', { name: 'Vistas de paquetes' });
    await userEvent.click(within(tabs).getByRole('tab', { name: /Todos/ }));
    const qs = new URLSearchParams((replace.mock.calls.at(-1)?.[0] as string).split('?')[1]);
    expect(qs.get('tab')).toBe('all');
  });
});

describe('Detalle y entrega (P3)', () => {
  it('"Entregar" abre el panel: entregar a un residente de la unidad con nota', async () => {
    actions.deliverPackageAction.mockResolvedValue({});
    render(<PackagesTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Paquetes' });
    await userEvent.click(await within(table).findByRole('button', { name: 'Entregar paquete de Casa 126' }));

    const panel = await screen.findByRole('dialog', { name: 'Casa 126' });
    expect(within(panel).getByText('Paquete #1 · Servientrega')).toBeInTheDocument();
    expect(within(panel).getByText('6 días en portería')).toBeInTheDocument();
    expect(await within(panel).findByText(/Recibió Carlos Portero/)).toBeInTheDocument();
    const recipients = within(panel).getByRole('radiogroup', { name: 'Entregar a' });
    expect(await within(recipients).findByRole('radio', { name: /María López/ })).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(within(recipients).getByRole('radio', { name: /Juan López/ }));
    await userEvent.type(within(panel).getByLabelText('Nota'), 'Firmó');
    await userEvent.click(within(panel).getByRole('button', { name: /Confirmar entrega · \d{2}:\d{2}/ }));
    await waitFor(() =>
      expect(actions.deliverPackageAction).toHaveBeenCalledWith({ businessId: 7, packageId: 1, data: { notes: 'Entregado a: Juan López. Firmó' }, token: 'T' }),
    );
    expect(await screen.findByText('Paquete de Casa 126 entregado a Juan López')).toBeInTheDocument();
  });

  it('otra persona exige nombre y lo deja en la nota', async () => {
    actions.deliverPackageAction.mockResolvedValue({});
    render(<PackagesTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Paquetes' });
    await userEvent.click(await within(table).findByRole('button', { name: 'Entregar paquete de Casa 126' }));
    const panel = await screen.findByRole('dialog', { name: 'Casa 126' });
    await userEvent.click(await within(panel).findByRole('radio', { name: /Otra persona/ }));
    await userEvent.click(within(panel).getByRole('button', { name: /Confirmar entrega/ }));
    expect(await within(panel).findByText('Escribe el nombre de quien recibe')).toBeInTheDocument();
    await userEvent.type(within(panel).getByLabelText('Nombre'), 'Pedro Vecino');
    await userEvent.type(within(panel).getByLabelText('Documento'), '999');
    await userEvent.click(within(panel).getByRole('button', { name: /Confirmar entrega/ }));
    await waitFor(() => expect(actions.deliverPackageAction.mock.calls[0][0].data).toEqual({ notes: 'Entregado a: Pedro Vecino (999).' }));
  });

  it('"Devolver" desde ⋮ pide confirmación', async () => {
    actions.deletePackageAction.mockResolvedValue(undefined);
    render(<PackagesTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Paquetes' });
    await userEvent.click((await within(table).findAllByRole('button', { name: /Más acciones del paquete de Casa 126/ }))[0]);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Devolver' }));
    const confirm = await screen.findByRole('dialog', { name: '¿Devolver el paquete?' });
    await userEvent.click(within(confirm).getByRole('button', { name: 'Sí, devolver' }));
    await waitFor(() => expect(actions.deletePackageAction).toHaveBeenCalledWith({ businessId: 7, packageId: 1, token: 'T' }));
  });
});

describe('Recibir paquete (P2)', () => {
  it('un paso: unidad, transportadora en chips (Otra → campo), guía opcional, "Recibir · HH:MM"', async () => {
    actions.receivePackageAction.mockResolvedValue({});
    render(<PackagesTable businessId={7} />);
    await userEvent.click(screen.getAllByRole('button', { name: '+ Recibir paquete' })[0]);
    const dialog = await screen.findByRole('dialog', { name: 'Recibir paquete' });
    const submit = within(dialog).getByRole('button', { name: /Recibir · \d{2}:\d{2}/ });
    await userEvent.click(submit);
    expect(await within(dialog).findByText('Elige la unidad a la que llega el paquete')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('combobox', { name: /Unidad/ }));
    await userEvent.click(await within(dialog).findByRole('option', { name: 'Casa 126' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Otra' }));
    await userEvent.type(within(dialog).getByLabelText('Otra transportadora'), 'Envía');
    expect(within(dialog).getByRole('button', { name: /Foto/ })).toBeDisabled();
    await userEvent.type(within(dialog).getByLabelText('Descripción'), 'Sobre');
    await userEvent.click(submit);

    await waitFor(() =>
      expect(actions.receivePackageAction).toHaveBeenCalledWith({
        businessId: 7,
        token: 'T',
        data: expect.objectContaining({ propertyUnitId: 40, carrier: 'Envía', trackingNumber: '', description: 'Sobre', notifyResident: true }),
      }),
    );
    expect(await screen.findByText('Paquete para Casa 126 recibido')).toBeInTheDocument();
  });
});
