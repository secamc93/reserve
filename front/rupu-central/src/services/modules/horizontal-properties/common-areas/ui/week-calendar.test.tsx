import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-public-sans', className: 'font-public-sans' }),
  JetBrains_Mono: () => ({ variable: 'font-jetbrains', className: 'font-jetbrains' }),
}));

import { WeekCalendar } from './week-calendar';
import { weekDays } from './design';
import type { ReservationListDTO } from '../domain';

const r = (over: Partial<ReservationListDTO>): ReservationListDTO => ({
  id: 1,
  commonAreaId: 2,
  commonAreaName: 'BBQ',
  propertyUnitId: 9,
  propertyUnitNumber: '126',
  propertyUnitBlock: 'Casa',
  residentName: '',
  statusCode: 'pending',
  statusName: 'Pendiente',
  reservationDate: '2026-10-14T00:00:00Z',
  startTime: '14:00',
  endTime: '18:00',
  numberOfGuests: 8,
  requiresApproval: true,
  depositPaid: false,
  fullPaymentPaid: false,
  createdAt: '',
  ...over,
});

describe('Calendario semanal (Z3)', () => {
  it('pinta cada reserva en su día y oculta las canceladas', async () => {
    const onSelect = vi.fn();
    render(
      <WeekCalendar
        days={weekDays('2026-10-12')}
        today="2026-10-15"
        schedules={[{ dayOfWeek: 3, startTime: '08:00', endTime: '22:00', isActive: true }]}
        reservations={[
          r({ id: 1 }),
          r({ id: 2, reservationDate: '2026-10-17T00:00:00Z', propertyUnitNumber: '7', propertyUnitBlock: 'Dúplex', statusCode: 'approved', startTime: '10:00', endTime: '12:00' }),
          r({ id: 3, statusCode: 'cancelled', propertyUnitNumber: '300' }),
        ]}
        onSelect={onSelect}
      />,
    );

    const wednesday = screen.getByRole('gridcell', { name: 'Reservas del 2026-10-14' });
    const block = within(wednesday).getByRole('button', { name: 'Casa 126, 14:00 a 18:00, Pendiente' });
    expect(within(screen.getByRole('gridcell', { name: 'Reservas del 2026-10-17' })).getByRole('button', { name: 'Dúplex 7, 10:00 a 12:00, Aprobada' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Casa 300/ })).not.toBeInTheDocument();

    await userEvent.click(block);
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('marca el día de hoy en la cabecera', () => {
    render(<WeekCalendar days={weekDays('2026-10-12')} today="2026-10-15" schedules={[]} reservations={[]} onSelect={vi.fn()} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(8);
    expect(within(headers[4]).getByText('15').className).toContain('bg-[#1a1a1a]');
  });
});
