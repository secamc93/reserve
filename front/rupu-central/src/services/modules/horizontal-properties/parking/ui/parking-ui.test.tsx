import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = vi.hoisted(() => ({
  createParkingSlotsBulkAction: vi.fn(),
  assignParkingSafeAction: vi.fn(),
  createParkingReservationSafeAction: vi.fn(),
  createParkingZoneSafeAction: vi.fn(),
  releaseParkingAssignmentAction: vi.fn(),
  updateParkingAssignmentAction: vi.fn(),
}));
vi.mock('../infrastructure/actions', () => actions);
vi.mock('../../units/infrastructure/actions', () => ({ getPropertyUnitsAction: vi.fn() }));
vi.mock('../../residents/infrastructure/actions', () => ({ getResidentsAction: vi.fn() }));
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-public-sans', className: 'font-public-sans' }),
  JetBrains_Mono: () => ({ variable: 'font-jetbrains', className: 'font-jetbrains' }),
}));
vi.mock('./use-parking-data', () => ({ parkingToken: () => 'T' }));

import { SlotMap } from './slot-map';
import { BulkSlotsDialog } from './parking-forms';
import type { ParkingData } from './use-parking-data';
import type { ParkingSlotListDTO } from '../domain';

const slot = (id: number, n: string, extra: Partial<ParkingSlotListDTO> = {}): ParkingSlotListDTO => ({
  id, parkingZoneId: 1, parkingZoneName: 'Sótano 2', parkingTypeId: 1, parkingTypeName: 'Carro', slotNumber: n,
  isCovered: true, hasCharger: false, isActive: true, isAvailable: true, isAssigned: false, isOccupied: false, ...extra,
});

const data = (): ParkingData => ({
  zones: [{ id: 1, name: 'Sótano 2', code: 'P2', location: 'rampa sur', totalSlots: 3, isActive: true }],
  slots: [slot(1, 'P2-101'), slot(2, 'P2-102', { isAssigned: true, hasCharger: true, width: 2.5, length: 5 }), slot(3, 'P2-103', { isAssigned: true, isOccupied: true })],
  assignmentBySlot: new Map([[2, { id: 9, parkingSlotId: 2, parkingSlotNumber: 'P2-102', propertyUnitId: 5, propertyUnitNumber: '126', propertyUnitBlock: 'Casa', residentName: 'CAMACHO MATEUS SEBASTIAN', vehiclePlate: 'KLM-220', vehicleBrand: 'Mazda', vehicleModel: 'CX-30', vehicleColor: 'gris', startDate: '2026-01-01', isActive: true }]]),
  reservationsBySlot: new Map(),
  todayReservations: [],
  types: [],
  summary: null,
});

describe('K1 · mapa de cupos', () => {
  it('una celda por cupo con su estado, y el resumen de la zona', () => {
    render(<SlotMap data={data()} today={new Date(2026, 9, 15)} onAssign={vi.fn()} onEditAssignment={vi.fn()} onRelease={vi.fn()} onCreateSlots={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Cupo P2-101, Libre' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cupo P2-102, Asignado · vacío' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cupo P2-103, Ocupado' })).toBeInTheDocument();
    expect(screen.getByText(/1 ocupados/)).toBeInTheDocument();
  });

  it('al elegir un cupo asignado muestra unidad, vehículo y las acciones', async () => {
    const onRelease = vi.fn();
    render(<SlotMap data={data()} today={new Date(2026, 9, 15)} onAssign={vi.fn()} onEditAssignment={vi.fn()} onRelease={onRelease} onCreateSlots={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cupo P2-102, Asignado · vacío' }));
    const panel = screen.getByRole('complementary', { name: 'Cupo P2-102' });
    expect(panel).toHaveTextContent('Casa 126');
    expect(panel).toHaveTextContent('KLM-220');
    expect(panel).toHaveTextContent('Mazda CX-30 · gris');
    expect(panel).toHaveTextContent('Cargador EV');
    await userEvent.click(screen.getByRole('button', { name: 'Liberar' }));
    expect(onRelease).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
  });

  it('un cupo libre ofrece asignarlo', async () => {
    const onAssign = vi.fn();
    render(<SlotMap data={data()} today={new Date(2026, 9, 15)} onAssign={onAssign} onEditAssignment={vi.fn()} onRelease={vi.fn()} onCreateSlots={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cupo P2-101, Libre' }));
    await userEvent.click(screen.getByRole('button', { name: 'Asignar este cupo' }));
    expect(onAssign).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
  });

  it('el chip "Libres" deja solo los cupos libres', async () => {
    render(<SlotMap data={data()} today={new Date(2026, 9, 15)} onAssign={vi.fn()} onEditAssignment={vi.fn()} onRelease={vi.fn()} onCreateSlots={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /Libres/ }));
    expect(screen.getByRole('button', { name: 'Cupo P2-101, Libre' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cupo P2-103, Ocupado' })).not.toBeInTheDocument();
  });
});

describe('K2 · cupos en lote', () => {
  beforeEach(() => vi.clearAllMocks());

  it('muestra cuántos cupos se crearán y los crea con el prefijo de la zona', async () => {
    actions.createParkingSlotsBulkAction.mockResolvedValue({ success: true, data: { created: 12 } });
    const onSaved = vi.fn();
    render(
      <BulkSlotsDialog
        open
        businessId={1}
        zones={[{ id: 1, name: 'Sótano 2', code: 'P2', location: '', totalSlots: 0, isActive: true }]}
        types={[{ id: 1, name: 'Carro', code: 'car', description: '', isActive: true, createdAt: '', updatedAt: '' }, { id: 2, name: 'Moto', code: 'moto', description: '', isActive: true, createdAt: '', updatedAt: '' }]}
        onClose={vi.fn()}
        onSaved={onSaved}
      />,
    );
    const user = userEvent.setup();
    await user.clear(screen.getByLabelText('Desde'));
    await user.type(screen.getByLabelText('Desde'), '121');
    await user.clear(screen.getByLabelText('Hasta'));
    await user.type(screen.getByLabelText('Hasta'), '132');
    expect(screen.getByText(/P2-121 … P2-132/)).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Moto' }));
    await user.click(screen.getByLabelText('Cubierto'));
    await user.click(screen.getByRole('button', { name: 'Crear 12 cupos' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(12));
    expect(actions.createParkingSlotsBulkAction).toHaveBeenCalledWith({
      businessId: 1,
      token: 'T',
      data: expect.objectContaining({ parkingZoneId: 1, parkingTypeId: 2, prefix: 'P2-', from: 121, to: 132, pad: 3, isCovered: true }),
    });
  });

  it('muestra el error del back (número repetido)', async () => {
    actions.createParkingSlotsBulkAction.mockResolvedValue({ success: false, error: 'Ya existen cupos con esos números' });
    render(<BulkSlotsDialog open businessId={1} zones={[{ id: 1, name: 'Sótano 2', code: 'P2', location: '', totalSlots: 0, isActive: true }]} types={[{ id: 1, name: 'Carro', code: 'car', description: '', isActive: true, createdAt: '', updatedAt: '' }]} onClose={vi.fn()} onSaved={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: /Crear 10 cupos/ }));
    expect(await screen.findByText('Ya existen cupos con esos números')).toBeInTheDocument();
  });
});
