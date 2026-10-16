import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-public-sans', className: 'font-public-sans' }),
  JetBrains_Mono: () => ({ variable: 'font-jetbrains', className: 'font-jetbrains' }),
}));

const actions = vi.hoisted(() => ({
  getCommonAreaTypesAction: vi.fn(),
  getCommonAreaByIdAction: vi.fn(),
  getSchedulesAction: vi.fn(),
  setSchedulesAction: vi.fn(),
  createCommonAreaAction: vi.fn(),
  updateCommonAreaAction: vi.fn(),
}));
vi.mock('../infrastructure/actions', () => actions);

import { AreaFormModal } from './area-form-modal';

const types = [
  { id: 3, name: 'BBQ', code: 'bbq', defaultMaxCapacity: 15, requiresApproval: true, allowsRecurring: false, isActive: true },
  { id: 5, name: 'Piscina', code: 'pool', defaultMaxCapacity: 30, requiresApproval: false, allowsRecurring: false, isActive: true },
];
const getToken = () => Promise.resolve('T');

describe('Nueva / editar zona (Z2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.getCommonAreaTypesAction.mockResolvedValue({ success: true, data: types });
    actions.setSchedulesAction.mockResolvedValue({ success: true, data: [] });
  });

  it('crea la zona con reglas y guarda el horario de los días elegidos', async () => {
    const onSaved = vi.fn();
    actions.createCommonAreaAction.mockResolvedValue({ success: true, data: { id: 9, name: 'BBQ Norte' } });
    render(<AreaFormModal open businessId={1} areaId={null} getToken={getToken} onClose={vi.fn()} onSaved={onSaved} />);

    const name = await screen.findByLabelText('Nombre');
    expect(screen.getByRole('dialog', { name: 'Nueva zona' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Reglas de reserva' })).toBeInTheDocument();
    expect(screen.getByLabelText('Capacidad')).toHaveValue(15);

    await userEvent.click(screen.getByRole('button', { name: 'Crear zona' }));
    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(actions.createCommonAreaAction).not.toHaveBeenCalled();

    await userEvent.type(name, 'BBQ Norte');
    await userEvent.type(screen.getByLabelText('Tarifa/hora (COP)'), '20.000');
    await userEvent.type(screen.getByLabelText('Depósito (COP)'), '100.000');
    await userEvent.clear(screen.getByLabelText('Hora de apertura'));
    await userEvent.type(screen.getByLabelText('Hora de apertura'), '10:00');
    await userEvent.click(screen.getByRole('button', { name: 'Domingo' }));
    expect(screen.getByRole('button', { name: 'Domingo' })).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(screen.getByRole('button', { name: 'Crear zona' }));

    await waitFor(() => expect(actions.setSchedulesAction).toHaveBeenCalled());
    expect(actions.createCommonAreaAction.mock.calls[0][0]).toMatchObject({
      token: 'T',
      businessId: 1,
      data: { commonAreaTypeId: 3, name: 'BBQ Norte', maxCapacity: 15, hourlyRate: 20000, requiresDeposit: true, depositAmount: 100000, requiresApproval: true },
    });
    const { id, schedules } = actions.setSchedulesAction.mock.calls[0][0];
    expect(id).toBe(9);
    expect(schedules).toHaveLength(7);
    expect(schedules.find((s: { dayOfWeek: number }) => s.dayOfWeek === 0).isActive).toBe(false);
    expect(schedules.find((s: { dayOfWeek: number }) => s.dayOfWeek === 1)).toMatchObject({ isActive: true, startTime: '10:00', endTime: '22:00' });
    expect(onSaved).toHaveBeenCalledWith('Zona "BBQ Norte" creada');
  });

  it('al editar sin tocar el horario no lo reescribe', async () => {
    actions.getCommonAreaByIdAction.mockResolvedValue({
      success: true,
      data: { id: 4, businessId: 1, commonAreaTypeId: 5, name: 'Piscina', maxCapacity: 30, hasEquipment: false, requiresApproval: false, requiresDeposit: false, allowsRecurring: false, isActive: true, createdAt: '', updatedAt: '' },
    });
    actions.getSchedulesAction.mockResolvedValue({ success: true, data: [{ dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isActive: true }] });
    actions.updateCommonAreaAction.mockResolvedValue({ success: true, data: { id: 4, name: 'Piscina' } });
    render(<AreaFormModal open businessId={1} areaId={4} getToken={getToken} onClose={vi.fn()} onSaved={vi.fn()} />);

    await waitFor(() => expect(screen.getByLabelText('Nombre')).toHaveValue('Piscina'));
    expect(screen.getByLabelText('Hora de apertura')).toHaveValue('09:00');
    expect(screen.getByRole('button', { name: 'Sábado' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Lunes' })).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(screen.getByRole('switch', { name: 'Zona activa (recibe reservas)' }));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));
    await waitFor(() => expect(actions.updateCommonAreaAction).toHaveBeenCalled());
    expect(actions.updateCommonAreaAction.mock.calls[0][0]).toMatchObject({ id: 4, data: { isActive: false, commonAreaTypeId: 5 } });
    expect(actions.setSchedulesAction).not.toHaveBeenCalled();
  });

  it('muestra el error del servidor', async () => {
    actions.createCommonAreaAction.mockResolvedValue({ success: false, error: 'Ya existe una zona con ese nombre' });
    render(<AreaFormModal open businessId={1} areaId={null} getToken={getToken} onClose={vi.fn()} onSaved={vi.fn()} />);
    await userEvent.type(await screen.findByLabelText('Nombre'), 'BBQ');
    await userEvent.click(screen.getByRole('button', { name: 'Crear zona' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una zona con ese nombre');
    expect(actions.setSchedulesAction).not.toHaveBeenCalled();
  });
});
