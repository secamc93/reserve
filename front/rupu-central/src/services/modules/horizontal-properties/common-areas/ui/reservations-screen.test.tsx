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
vi.mock('./hooks/use-business-token', () => ({ useBusinessToken: () => () => Promise.resolve('T') }));

import { ReservationsScreen } from './reservations-screen';

const zone = {
  id: 2, name: 'BBQ', typeName: 'BBQ', location: '', maxCapacity: 15, hasEquipment: false, requiresDeposit: false, allowsRecurring: false,
  isActive: true, requiresApproval: true, schedules: [{ dayOfWeek: 3, startTime: '08:00', endTime: '22:00', isActive: true }],
};
const pendingItem = {
  id: 77, commonAreaId: 2, commonAreaName: 'BBQ', propertyUnitId: 9, propertyUnitNumber: '126', propertyUnitBlock: 'Casa', residentName: '',
  statusCode: 'pending', statusName: 'Pendiente', reservationDate: '2026-10-14T00:00:00Z', startTime: '14:00', endTime: '18:00', numberOfGuests: 8,
  requiresApproval: true, depositPaid: false, fullPaymentPaid: false, createdAt: '',
};
const page = (data: unknown[], total = data.length) => ({ success: true, data: { data, total, page: 1, pageSize: 10, totalPages: 1 } });

describe('Reservas (Z3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.getCommonAreasAction.mockResolvedValue(page([zone]));
    actions.getReservationsAction.mockImplementation((p: { status?: string[] }) => Promise.resolve(p.status?.[0] === 'pending' ? page([pendingItem], 3) : page([pendingItem])));
    actions.approveReservationAction.mockResolvedValue({ success: true, data: { ...pendingItem, statusCode: 'approved' } });
  });

  it('carga la semana de la zona y muestra los pendientes de aprobar', async () => {
    render(<ReservationsScreen businessId={1} />);

    const pending = await screen.findByRole('region', { name: 'Pendientes de aprobar' });
    expect(within(pending).getByText('Pendientes de aprobar · 3')).toBeInTheDocument();
    expect(within(pending).getByText('Casa 126')).toBeInTheDocument();

    // Calendario de la primera zona, semana del lunes 12 al domingo 18
    await waitFor(() =>
      expect(actions.getReservationsAction).toHaveBeenCalledWith(expect.objectContaining({ businessId: 1, commonAreaId: 2, startDate: '2026-10-12', endDate: '2026-10-18', pageSize: 200 })),
    );
    expect(await screen.findByRole('button', { name: 'Casa 126, 14:00 a 18:00, Pendiente' })).toBeInTheDocument();
    expect(screen.getByText('12 – 18 oct 2026')).toBeInTheDocument();
  });

  it('aprobar desde la lista de pendientes', async () => {
    render(<ReservationsScreen businessId={1} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Aprobar reserva de Casa 126' }));
    await waitFor(() => expect(actions.approveReservationAction).toHaveBeenCalledWith({ token: 'T', businessId: 1, id: 77 }));
    expect(await screen.findByText('Reserva de Casa 126 aprobada')).toBeInTheDocument();
  });

  it('cambiar de semana y de vista actualiza la URL', async () => {
    render(<ReservationsScreen businessId={1} />);
    await screen.findByRole('region', { name: 'Pendientes de aprobar' });
    await userEvent.click(screen.getByRole('button', { name: 'Semana siguiente' }));
    expect(nav.replace).toHaveBeenLastCalledWith('/properties/1/common-areas/reservations?semana=2026-10-19', { scroll: false });
    await userEvent.click(screen.getByRole('button', { name: 'Lista' }));
    expect(nav.replace).toHaveBeenLastCalledWith('/properties/1/common-areas/reservations?semana=2026-10-14&vista=lista', { scroll: false });
  });
});
