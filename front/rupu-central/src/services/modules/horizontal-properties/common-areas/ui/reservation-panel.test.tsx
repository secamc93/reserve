import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-public-sans', className: 'font-public-sans' }),
  JetBrains_Mono: () => ({ variable: 'font-jetbrains', className: 'font-jetbrains' }),
}));

const actions = vi.hoisted(() => ({
  getReservationByIdAction: vi.fn(),
  getReservationsAction: vi.fn(),
  approveReservationAction: vi.fn(),
  rejectReservationAction: vi.fn(),
  confirmReservationAction: vi.fn(),
  checkInReservationAction: vi.fn(),
  checkOutReservationAction: vi.fn(),
  cancelReservationAction: vi.fn(),
  updateReservationPaymentsAction: vi.fn(),
}));
vi.mock('../infrastructure/actions', () => actions);

import { ReservationPanel } from './reservation-panel';
import type { CommonAreaReservation } from '../domain';

const base: CommonAreaReservation = {
  id: 318,
  businessId: 1,
  commonAreaId: 2,
  commonAreaName: 'BBQ',
  propertyUnitId: 501,
  propertyUnitNumber: '126',
  propertyUnitBlock: 'Casa',
  residentName: 'Ana Pérez',
  reservationStatusId: 1,
  statusCode: 'pending',
  statusName: 'Pendiente',
  reservationDate: '2099-10-20T00:00:00Z',
  startTime: '14:00',
  endTime: '16:00',
  durationHours: 2,
  requiresApproval: true,
  numberOfGuests: 12,
  purpose: 'Cumpleaños',
  isRecurring: false,
  totalAmount: 40000,
  depositAmount: 100000,
  depositPaid: false,
  fullPaymentPaid: false,
  createdAt: '2026-10-10T15:00:00Z',
};

const listOf = (data: unknown[], total = data.length) => ({ success: true, data: { data, total, page: 1, pageSize: 10, totalPages: 1 } });
const other = (id: number, startTime: string, endTime: string) => ({ id, commonAreaId: 2, reservationDate: '2099-10-20T00:00:00Z', startTime, endTime, statusCode: 'approved', propertyUnitNumber: '7', propertyUnitBlock: 'Dúplex' });

function mockLists(sameDay: unknown[] = [], previous = 2) {
  actions.getReservationsAction.mockImplementation((p: { propertyUnitId?: number }) => Promise.resolve(p.propertyUnitId ? listOf([], previous) : listOf(sameDay)));
}

const renderPanel = (onChanged = vi.fn()) =>
  render(<ReservationPanel businessId={1} reservationId={318} getToken={() => Promise.resolve('T')} onClose={vi.fn()} onChanged={onChanged} />);

describe('Detalle de reserva (Z4)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('cabecera, unidad "Casa 126" con reservas previas, pagos y disponibilidad', async () => {
    actions.getReservationByIdAction.mockResolvedValue({ success: true, data: base });
    mockLists([base, other(9, '18:00', '20:00')]);
    renderPanel();

    const panel = await screen.findByRole('dialog', { name: 'Reserva de Casa 126 en BBQ' });
    expect(within(panel).getByText(/Reserva #318 · solicitada/)).toBeInTheDocument();
    expect(within(panel).getByText('Pendiente de aprobar')).toBeInTheDocument();
    expect(within(panel).getByText('requiere depósito')).toBeInTheDocument();
    expect(within(panel).getByRole('heading', { name: 'BBQ' })).toBeInTheDocument();
    expect(within(panel).getByText('12 invitados')).toBeInTheDocument();
    expect(within(panel).getByText('Casa 126')).toBeInTheDocument();
    expect(await within(panel).findByText('2 reservas previas')).toBeInTheDocument();
    expect(within(panel).getByText('Tarifa · 2 h × 20.000')).toBeInTheDocument();
    expect(within(panel).getByText('Depósito reembolsable')).toBeInTheDocument();
    expect(within(panel).getByText('140.000')).toBeInTheDocument();
    expect(await within(panel).findByText('✓ Sin cruces · siguiente reserva 18:00')).toBeInTheDocument();
    expect(within(panel).queryByText('501')).not.toBeInTheDocument();
    expect(actions.getReservationsAction).toHaveBeenCalledWith(expect.objectContaining({ commonAreaId: 2, startDate: '2099-10-20', endDate: '2099-10-20' }));
  });

  it('muestra el cruce en terracota', async () => {
    actions.getReservationByIdAction.mockResolvedValue({ success: true, data: base });
    mockLists([base, other(9, '15:00', '17:00')]);
    renderPanel();
    expect(await screen.findByText(/Se cruza con Dúplex 7 · 15:00–17:00/)).toBeInTheDocument();
  });

  it('pendiente: aprobar', async () => {
    const onChanged = vi.fn();
    actions.getReservationByIdAction.mockResolvedValue({ success: true, data: base });
    mockLists();
    actions.approveReservationAction.mockResolvedValue({ success: true, data: { ...base, statusCode: 'approved', approvedAt: '2026-10-11T10:00:00Z' } });
    renderPanel(onChanged);

    await userEvent.click(await screen.findByRole('button', { name: 'Aprobar' }));
    await waitFor(() => expect(actions.approveReservationAction).toHaveBeenCalledWith({ token: 'T', businessId: 1, id: 318 }));
    expect(onChanged).toHaveBeenCalledWith('Reserva de Casa 126 aprobada');
    expect(await screen.findByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
  });

  it('rechazar usa el mensaje al residente como motivo (obligatorio)', async () => {
    actions.getReservationByIdAction.mockResolvedValue({ success: true, data: base });
    mockLists();
    actions.rejectReservationAction.mockResolvedValue({ success: true, data: { ...base, statusCode: 'rejected' } });
    renderPanel();

    await userEvent.click(await screen.findByRole('button', { name: 'Rechazar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('motivo del rechazo');
    expect(actions.rejectReservationAction).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText('Mensaje al residente'), 'Zona en mantenimiento');
    await userEvent.click(screen.getByRole('button', { name: 'Rechazar' }));
    await waitFor(() => expect(actions.rejectReservationAction).toHaveBeenCalledWith({ token: 'T', businessId: 1, id: 318, reason: 'Zona en mantenimiento' }));
  });

  it('confirmada: marcar depósito pagado y registrar ingreso; cancelar pide confirmación', async () => {
    actions.getReservationByIdAction.mockResolvedValue({ success: true, data: { ...base, statusCode: 'confirmed', accessCode: '482913' } });
    mockLists();
    actions.updateReservationPaymentsAction.mockResolvedValue({ success: true, data: { ...base, statusCode: 'confirmed', depositPaid: true } });
    actions.checkInReservationAction.mockResolvedValue({ success: true, data: { ...base, statusCode: 'checked_in', checkedInAt: '2099-10-20T14:02:00Z' } });
    renderPanel();

    expect(await screen.findByText('482913')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Marcar depósito como pagado' }));
    await waitFor(() => expect(actions.updateReservationPaymentsAction).toHaveBeenCalledWith({ token: 'T', businessId: 1, id: 318, data: { depositPaid: true } }));

    await userEvent.click(await screen.findByRole('button', { name: 'Cancelar reserva' }));
    expect(screen.getByRole('button', { name: 'Confirmar cancelación' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Volver' }));

    await userEvent.click(screen.getByRole('button', { name: 'Registrar ingreso' }));
    await waitFor(() => expect(actions.checkInReservationAction).toHaveBeenCalled());
    expect(await screen.findByRole('button', { name: 'Registrar salida' })).toBeInTheDocument();
  });

  it('cancelada: sin acciones ni disponibilidad', async () => {
    actions.getReservationByIdAction.mockResolvedValue({ success: true, data: { ...base, statusCode: 'cancelled', cancelledAt: '2026-10-12T10:00:00Z', cancellationReason: 'Viaje' } });
    mockLists();
    renderPanel();
    expect(await screen.findByText('Viaje')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aprobar' })).not.toBeInTheDocument();
    expect(screen.queryByText('Disponibilidad')).not.toBeInTheDocument();
  });
});
