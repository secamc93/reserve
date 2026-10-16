import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-public-sans', className: 'font-public-sans' }),
  JetBrains_Mono: () => ({ variable: 'font-jetbrains', className: 'font-jetbrains' }),
}));

const actions = vi.hoisted(() => ({
  getSchedulesAction: vi.fn(),
  setSchedulesAction: vi.fn(),
  getRestrictionsAction: vi.fn(),
  createRestrictionAction: vi.fn(),
  deleteRestrictionAction: vi.fn(),
}));
vi.mock('../infrastructure/actions', () => actions);

import { AreaScheduleModal } from './area-schedule-modal';

const renderIt = (onSaved = vi.fn()) =>
  render(<AreaScheduleModal open businessId={1} area={{ id: 4, name: 'Salón' }} getToken={() => Promise.resolve('T')} onClose={vi.fn()} onSaved={onSaved} />);

describe('Horario y bloqueos de una zona', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.getSchedulesAction.mockResolvedValue({ success: true, data: [{ id: 1, dayOfWeek: 1, startTime: '08:00', endTime: '20:00', isActive: true }] });
    actions.getRestrictionsAction.mockResolvedValue({
      success: true,
      data: [{ id: 9, commonAreaId: 4, restrictionType: 'maintenance', startDate: '2026-10-20', endDate: '2026-10-20', reason: 'Pintura' }],
    });
  });

  it('abre el sábado y guarda los siete días', async () => {
    const onSaved = vi.fn();
    actions.setSchedulesAction.mockResolvedValue({ success: true, data: [] });
    renderIt(onSaved);

    expect(await screen.findByLabelText('Apertura Lunes')).toHaveValue('08:00');
    await userEvent.click(screen.getByRole('switch', { name: 'Abrir el sábado' }));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar horario' }));

    await waitFor(() => expect(actions.setSchedulesAction).toHaveBeenCalled());
    const { schedules, id, businessId } = actions.setSchedulesAction.mock.calls[0][0];
    expect({ id, businessId }).toEqual({ id: 4, businessId: 1 });
    expect(schedules).toHaveLength(7);
    expect(schedules.find((s: { dayOfWeek: number }) => s.dayOfWeek === 6)).toMatchObject({ isActive: true, startTime: '08:00', endTime: '22:00' });
    expect(schedules.find((s: { dayOfWeek: number }) => s.dayOfWeek === 1)).toMatchObject({ isActive: true, endTime: '20:00' });
    expect(onSaved).toHaveBeenCalledWith('Horario de "Salón" guardado');
  });

  it('lista, agrega y elimina bloqueos', async () => {
    actions.createRestrictionAction.mockResolvedValue({
      success: true,
      data: { id: 10, commonAreaId: 4, restrictionType: 'event', startDate: '2026-11-01', endDate: '2026-11-01', reason: 'Asamblea' },
    });
    actions.deleteRestrictionAction.mockResolvedValue({ success: true, data: null });
    renderIt();

    expect(await screen.findByText(/Pintura/)).toBeInTheDocument();

    await userEvent.selectOptions(screen.getByLabelText('Motivo'), 'event');
    await userEvent.clear(screen.getByLabelText('Desde'));
    await userEvent.type(screen.getByLabelText('Desde'), '2026-11-01');
    await userEvent.clear(screen.getByLabelText('Hasta'));
    await userEvent.type(screen.getByLabelText('Hasta'), '2026-11-01');
    await userEvent.type(screen.getByLabelText('Detalle del bloqueo'), 'Asamblea');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar bloqueo' }));

    await waitFor(() =>
      expect(actions.createRestrictionAction).toHaveBeenCalledWith({
        token: 'T',
        businessId: 1,
        id: 4,
        data: { restrictionType: 'event', startDate: '2026-11-01', endDate: '2026-11-01', startTime: undefined, endTime: undefined, reason: 'Asamblea' },
      }),
    );
    expect(await screen.findByText(/Asamblea/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar bloqueo Mantenimiento 2026-10-20' }));
    await waitFor(() => expect(actions.deleteRestrictionAction).toHaveBeenCalledWith({ token: 'T', businessId: 1, id: 4, restrictionId: 9 }));
    await waitFor(() => expect(screen.queryByText(/Pintura/)).not.toBeInTheDocument());
  });
});
