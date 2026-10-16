import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-public-sans', className: 'font-public-sans' }),
  JetBrains_Mono: () => ({ variable: 'font-jetbrains', className: 'font-jetbrains' }),
}));

const nav = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn(), params: new URLSearchParams('semana=2026-10-14') }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: nav.replace, push: nav.push }),
  usePathname: () => '/properties/1/common-areas/reservations',
  useSearchParams: () => nav.params,
}));

const actions = vi.hoisted(() => ({
  getCommonAreasAction: vi.fn(),
  getReservationsAction: vi.fn(),
  approveReservationAction: vi.fn(),
  getReservationByIdAction: vi.fn(),
  createReservationAction: vi.fn(),
  searchUnitsAction: vi.fn(),
}));
vi.mock('../infrastructure/actions', () => actions);
const stableToken = vi.hoisted(() => () => Promise.resolve('T'));
vi.mock('./hooks/use-business-token', () => ({ useBusinessToken: () => stableToken }));

import { ReservationsScreen } from './reservations-screen';

const zone = {
  id: 2, name: 'BBQ', typeName: 'BBQ', location: '', maxCapacity: 15, hasEquipment: false, requiresDeposit: false, allowsRecurring: false,
  isActive: true, requiresApproval: true, schedules: [{ dayOfWeek: 3, startTime: '08:00', endTime: '22:00', isActive: true }], restrictions: [],
};
const pendingItem = {
  id: 77, commonAreaId: 2, commonAreaName: 'BBQ', propertyUnitId: 9, propertyUnitNumber: '126', propertyUnitBlock: 'Casa', residentName: '',
  statusCode: 'pending', statusName: 'Pendiente', reservationDate: '2099-10-14T00:00:00Z', startTime: '14:00', endTime: '18:00', numberOfGuests: 8,
  requiresApproval: true, depositPaid: false, fullPaymentPaid: false, createdAt: '2026-10-14T00:00:00Z',
};
const weekItem = { ...pendingItem, id: 78, reservationDate: '2026-10-14T00:00:00Z', statusCode: 'approved', statusName: 'Aprobada', propertyUnitNumber: '7', propertyUnitBlock: 'Dúplex' };
const page = (data: unknown[], total = data.length) => ({ success: true, data: { data, total, page: 1, pageSize: 10, totalPages: 1 } });

describe('Reservas (Z3 / Z5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nav.params = new URLSearchParams('semana=2026-10-14');
    actions.getCommonAreasAction.mockResolvedValue(page([zone]));
    actions.getReservationsAction.mockImplementation((p: { status?: string[]; startDate?: string }) =>
      Promise.resolve(p.status?.[0] === 'pending' ? page([pendingItem], 2) : p.startDate ? page([weekItem]) : page([weekItem])),
    );
    actions.approveReservationAction.mockResolvedValue({ success: true, data: { ...pendingItem, statusCode: 'approved' } });
  });

  it('cabecera con pestañas y calendario de la semana de todas las zonas', async () => {
    render(<ReservationsScreen businessId={1} />);
    const tabs = await screen.findByRole('tablist', { name: 'Zonas comunes' });
    await waitFor(() => expect(within(tabs).getByRole('tab', { name: /^Pendientes\s*·\s*2$/ })).toBeInTheDocument());
    expect(within(tabs).getByRole('tab', { name: /^Zonas\s*·\s*1$/ })).toBeInTheDocument();
    expect(within(tabs).getByRole('tab', { name: 'Calendario de reservas' })).toHaveAttribute('aria-selected', 'true');
    expect(within(tabs).getByRole('tab', { name: 'Historial' })).toBeInTheDocument();

    expect(actions.getReservationsAction).toHaveBeenCalledWith(expect.objectContaining({ businessId: 1, startDate: '2026-10-12', endDate: '2026-10-18', pageSize: 200 }));
    expect(await screen.findByRole('button', { name: /^BBQ, Dúplex 7, 14:00 a 18:00/ })).toBeInTheDocument();
    expect(screen.getByText('12 – 18 oct 2026')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Zona' })).toHaveTextContent('Todas las zonas');
  });

  it('pestaña Pendientes: tabla con aprobación rápida', async () => {
    nav.params = new URLSearchParams('tab=pendientes');
    render(<ReservationsScreen businessId={1} />);
    const table = await screen.findByRole('table', { name: 'Reservas pendientes de aprobar' });
    await userEvent.click(await within(table).findByRole('button', { name: 'Aprobar reserva de Casa 126' }));
    await waitFor(() => expect(actions.approveReservationAction).toHaveBeenCalledWith({ token: 'T', businessId: 1, id: 77 }));
    expect(await screen.findByText('Reserva de Casa 126 aprobada')).toBeInTheDocument();
  });

  it('pestaña Historial pide reservas hasta ayer', async () => {
    nav.params = new URLSearchParams('tab=historial');
    render(<ReservationsScreen businessId={1} />);
    expect(await screen.findByRole('table', { name: 'Historial de reservas' })).toBeInTheDocument();
    await waitFor(() => expect(actions.getReservationsAction).toHaveBeenCalledWith(expect.objectContaining({ endDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), page: 1 })));
  });

  it('cambiar de pestaña y de semana actualiza la URL', async () => {
    render(<ReservationsScreen businessId={1} />);
    const tabs = await screen.findByRole('tablist', { name: 'Zonas comunes' });
    await userEvent.click(screen.getByRole('button', { name: 'Semana siguiente' }));
    expect(nav.replace).toHaveBeenLastCalledWith('/properties/1/common-areas/reservations?semana=2026-10-19', { scroll: false });
    await userEvent.click(within(tabs).getByRole('tab', { name: /Pendientes/ }));
    expect(nav.replace).toHaveBeenLastCalledWith('/properties/1/common-areas/reservations?semana=2026-10-14&tab=pendientes', { scroll: false });
    await userEvent.click(within(tabs).getByRole('tab', { name: /Zonas/ }));
    expect(nav.push).toHaveBeenCalledWith('/properties/1/common-areas');
  });

  it('móvil (Z5): chips y tarjeta de pendiente con Aprobar / Rechazar', async () => {
    render(<ReservationsScreen businessId={1} />);
    const chips = await screen.findByRole('group', { name: 'Filtro de reservas' });
    await waitFor(() => expect(within(chips).getByRole('button', { name: /^Pendientes\s*·\s*2$/ })).toBeInTheDocument());
    const card = await screen.findByRole('article', { name: 'Reserva de Casa 126 en BBQ' });
    expect(within(card).getByText('Pendiente')).toBeInTheDocument();
    expect(within(card).getByRole('button', { name: 'Rechazar reserva de Casa 126' })).toBeInTheDocument();
    await userEvent.click(within(card).getByRole('button', { name: 'Aprobar reserva de Casa 126' }));
    await waitFor(() => expect(actions.approveReservationAction).toHaveBeenCalled());
  });
});
