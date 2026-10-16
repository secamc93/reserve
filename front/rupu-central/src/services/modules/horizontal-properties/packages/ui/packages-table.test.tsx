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
  getResidentsAction: vi.fn().mockResolvedValue({ residents: [] }),
}));

import { PackagesTable } from './packages-table';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
const pkg = (over: Partial<PackageListDTO>): PackageListDTO => ({
  id: 1,
  trackingNumber: 'SV-1',
  carrier: 'Servientrega',
  propertyUnitNumber: '126',
  propertyUnitBlock: 'Casa',
  residentName: 'María López',
  statusName: 'En almacén',
  statusCode: 'in_storage',
  receivedAt: hoursAgo(100),
  createdAt: hoursAgo(100),
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  search = '';
  actions.getPackagesAction.mockResolvedValue({
    packages: [
      pkg({ id: 1 }),
      pkg({ id: 2, trackingNumber: 'IR-2', carrier: 'Interrapidísimo', propertyUnitNumber: '8', propertyUnitBlock: 'Dúplex', residentName: '', statusCode: 'received', receivedAt: hoursAgo(2) }),
      pkg({ id: 3, trackingNumber: 'CO-3', statusCode: 'delivered', deliveredAt: hoursAgo(1) }),
    ],
    total: 3,
    page: 1,
    pageSize: 10,
    totalPages: 1,
  });
  actions.getPackagesSummaryAction.mockResolvedValue({ pending: 2, pendingOverdue: 1, deliveredToday: 1, delivered: 1, closed: 0, total: 3 });
  actions.getPackageByIdAction.mockResolvedValue({ id: 1, statusCode: 'in_storage', qrCode: 'PKG-QR-1', notifyResident: true });
});

describe('Paquetes (P1)', () => {
  it('lista con "Casa 126", antigüedad y alerta de más de 3 días', async () => {
    render(<PackagesTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Paquetes' });
    expect((await within(table).findAllByText('María López')).length).toBe(2);
    expect(within(table).getAllByText('Casa 126').length).toBe(2);
    expect(within(table).getByText('Dúplex 8')).toBeInTheDocument();
    expect(within(table).getByText('4 d')).toBeInTheDocument();
    expect(within(table).getByText('2 h')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: /1 con más de 3 días/ })).toBeInTheDocument();
    const chips = screen.getByRole('group', { name: 'Estado del paquete' });
    expect(await within(chips).findByRole('button', { name: /Por entregar\s*·\s*2/ })).toBeInTheDocument();
    // Solo los por entregar (recibido / en almacén) tienen "Entregar"
    expect(within(table).getAllByRole('button', { name: /Entregar paquete de/ })).toHaveLength(2);
    expect(actions.getPackagesAction.mock.calls[0][0]).toMatchObject({ businessId: 7, page: 1, pageSize: 10 });
  });

  it('el chip filtra por grupo en la URL', async () => {
    render(<PackagesTable businessId={7} />);
    const chips = await screen.findByRole('group', { name: 'Estado del paquete' });
    await userEvent.click(within(chips).getByRole('button', { name: /Entregados/ }));
    const qs = new URLSearchParams((replace.mock.calls.at(-1)?.[0] as string).split('?')[1]);
    expect(qs.get('group')).toBe('delivered');
  });
});

describe('Detalle y entrega (P3)', () => {
  it('"Entregar" abre el panel con la entrega y confirma con notas', async () => {
    actions.deliverPackageAction.mockResolvedValue({});
    render(<PackagesTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Paquetes' });
    await userEvent.click((await within(table).findAllByRole('button', { name: 'Entregar paquete de Casa 126' }))[0]);

    const panel = await screen.findByRole('dialog', { name: 'Casa 126' });
    expect(within(panel).getByRole('region', { name: 'Línea de tiempo' })).toBeInTheDocument();
    expect(within(panel).getByText('Más de 3 días')).toBeInTheDocument();
    await userEvent.type(within(panel).getByLabelText('Notas de la entrega'), 'Recibió el portero');
    await userEvent.click(within(panel).getByRole('button', { name: 'Confirmar entrega' }));
    await waitFor(() =>
      expect(actions.deliverPackageAction).toHaveBeenCalledWith({ businessId: 7, packageId: 1, data: { notes: 'Recibió el portero' }, token: 'T' }),
    );
    expect(await screen.findByText('Paquete de Casa 126 entregado')).toBeInTheDocument();
  });

  it('marcar como devuelto pide confirmación', async () => {
    actions.deletePackageAction.mockResolvedValue(undefined);
    render(<PackagesTable businessId={7} />);
    const table = await screen.findByRole('table', { name: 'Paquetes' });
    await userEvent.click((await within(table).findAllByText('María López'))[0]);
    const panel = await screen.findByRole('dialog', { name: 'Casa 126' });
    await userEvent.click(within(panel).getByRole('button', { name: 'Marcar como devuelto' }));
    const confirm = await screen.findByRole('dialog', { name: '¿Marcar como devuelto?' });
    await userEvent.click(within(confirm).getByRole('button', { name: 'Sí, devuelto' }));
    await waitFor(() => expect(actions.deletePackageAction).toHaveBeenCalledWith({ businessId: 7, packageId: 1, token: 'T' }));
  });
});

describe('Recibir paquete (P2)', () => {
  it('pide unidad, transportadora y guía; envía con la unidad elegida', async () => {
    actions.receivePackageAction.mockResolvedValue({});
    render(<PackagesTable businessId={7} />);
    await userEvent.click(screen.getByRole('button', { name: '+ Recibir paquete' }));
    const dialog = await screen.findByRole('dialog', { name: 'Recibir paquete' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Recibir paquete' }));
    expect(await within(dialog).findByText('Elige la unidad a la que llega el paquete')).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('combobox', { name: /Unidad/ }));
    await userEvent.click(await within(dialog).findByRole('option', { name: 'Casa 126' }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Servientrega' }));
    await userEvent.type(within(dialog).getByLabelText(/Número de guía/), 'SV-999');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Recibir paquete' }));

    await waitFor(() =>
      expect(actions.receivePackageAction).toHaveBeenCalledWith({
        businessId: 7,
        token: 'T',
        data: expect.objectContaining({ propertyUnitId: 40, carrier: 'Servientrega', trackingNumber: 'SV-999', notifyResident: true }),
      }),
    );
    expect(await screen.findByText('Paquete para Casa 126 recibido')).toBeInTheDocument();
  });
});
