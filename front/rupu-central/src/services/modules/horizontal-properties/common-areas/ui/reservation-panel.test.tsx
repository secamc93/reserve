import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-public-sans', className: 'font-public-sans' }),
  JetBrains_Mono: () => ({ variable: 'font-jetbrains', className: 'font-jetbrains' }),
}));

const actions = vi.hoisted(() => ({
  getReservationByIdAction: vi.fn(),
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
  id: 77,
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
  reservationDate: '2026-10-20T00:00:00Z',
  startTime: '14:00',
  endTime: '18:00',
  durationHours: 4,
  requiresApproval: true,
  numberOfGuests: 12,
  purpose: 'Cumpleaños',
  isRecurring: false,
  totalAmount: 120000,
  depositAmount: 50000,
  depositPaid: false,
  fullPaymentPaid: false,
  createdAt: '2026-10-10T15:00:00Z',
};

const renderPanel = (onChanged = vi.fn()) =>
  render(<ReservationPanel businessId={1} reservationId={77} getToken={() => Promise.resolve('T')} onClose={vi.fn()} onChanged={onChanged} />);

describe('Detalle de reserva (Z4)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra la unidad como "Casa 126", fecha, pagos y la línea de tiempo', async () => {
    actions.getReservationByIdAction.mockResolvedValue({ success: true, data: base });
    renderPanel();
    expect(await screen.findByRole('dialog', { name: 'Reserva de Casa 126 en BBQ' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Casa 126' })).toBeInTheDocument();
    expect(screen.getByText('Martes 20 oct 2026')).toBeInTheDocument();
    expect(screen.getByText('Pago completo')).toBeInTheDocument();
    expect(screen.getByText('Depósito')).toBeInTheDocument();
    expect(screen.getByText('Solicitada')).toBeInTheDocument();
    expect(screen.queryByText('501')).not.toBeInTheDocument();
    expect(actions.getReservationByIdAction).toHaveBeenCalledWith({ token: 'T', businessId: 1, id: 77 });
  });

  it('pendiente: aprobar llama la acción y avisa el cambio', async () => {
    const onChanged = vi.fn();
    actions.getReservationByIdAction.mockResolvedValue({ success: true, data: base });
    actions.approveReservationAction.mockResolvedValue({ success: true, data: { ...base, statusCode: 'approved', approvedAt: '2026-10-11T10:00:00Z' } });
    renderPanel(onChanged);

    await userEvent.click(await screen.findByRole('button', { name: 'Aprobar' }));
    await waitFor(() => expect(actions.approveReservationAction).toHaveBeenCalledWith({ token: 'T', businessId: 1, id: 77 }));
    expect(onChanged).toHaveBeenCalledWith('Reserva de Casa 126 aprobada');
    // Ya aprobada: la siguiente acción es confirmar
    expect(await screen.findByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
  });

  it('rechazar exige el motivo', async () => {
    actions.getReservationByIdAction.mockResolvedValue({ success: true, data: base });
    actions.rejectReservationAction.mockResolvedValue({ success: true, data: { ...base, statusCode: 'rejected' } });
    renderPanel();

    await userEvent.click(await screen.findByRole('button', { name: 'Rechazar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar rechazo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Escribe el motivo del rechazo');
    expect(actions.rejectReservationAction).not.toHaveBeenCalled();

    await userEvent.type(screen.getByLabelText('Motivo del rechazo'), 'Zona en mantenimiento');
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar rechazo' }));
    await waitFor(() => expect(actions.rejectReservationAction).toHaveBeenCalledWith({ token: 'T', businessId: 1, id: 77, reason: 'Zona en mantenimiento' }));
  });

  it('confirmada: registra el ingreso; marcar el depósito como pagado', async () => {
    actions.getReservationByIdAction.mockResolvedValue({ success: true, data: { ...base, statusCode: 'confirmed', accessCode: '482913' } });
    actions.checkInReservationAction.mockResolvedValue({ success: true, data: { ...base, statusCode: 'checked_in', checkedInAt: '2026-10-20T14:02:00Z' } });
    actions.updateReservationPaymentsAction.mockResolvedValue({ success: true, data: { ...base, statusCode: 'confirmed', depositPaid: true } });
    renderPanel();

    expect(await screen.findByText('482913')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Marcar depósito como pagado' }));
    await waitFor(() => expect(actions.updateReservationPaymentsAction).toHaveBeenCalledWith({ token: 'T', businessId: 1, id: 77, data: { depositPaid: true } }));

    await userEvent.click(await screen.findByRole('button', { name: 'Registrar ingreso' }));
    await waitFor(() => expect(actions.checkInReservationAction).toHaveBeenCalled());
    expect(await screen.findByRole('button', { name: 'Registrar salida' })).toBeInTheDocument();
  });

  it('cancelada: sin acciones', async () => {
    actions.getReservationByIdAction.mockResolvedValue({ success: true, data: { ...base, statusCode: 'cancelled', cancelledAt: '2026-10-12T10:00:00Z', cancellationReason: 'Viaje' } });
    renderPanel();
    expect(await screen.findByText('Viaje')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aprobar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar reserva' })).not.toBeInTheDocument();
  });
});
