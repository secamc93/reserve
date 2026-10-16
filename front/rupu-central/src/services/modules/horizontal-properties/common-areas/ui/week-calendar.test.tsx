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
  reservationDate: '2026-10-16T00:00:00Z',
  startTime: '14:00',
  endTime: '18:00',
  numberOfGuests: 8,
  purpose: 'Cumpleaños',
  requiresApproval: true,
  depositPaid: false,
  fullPaymentPaid: false,
  createdAt: '',
  ...over,
});

const now = new Date(2026, 9, 15, 12, 0);

describe('Calendario semanal (Z3)', () => {
  it('bloques con zona, hora y "Casa 126 · motivo"; tono por estado y pasadas en gris', async () => {
    const onSelect = vi.fn();
    render(
      <WeekCalendar
        days={weekDays('2026-10-12')}
        today="2026-10-15"
        now={now}
        schedules={[]}
        reservations={[
          r({ id: 1 }),
          r({ id: 2, commonAreaName: 'Salón', reservationDate: '2026-10-17T00:00:00Z', propertyUnitNumber: '7', propertyUnitBlock: 'Dúplex', statusCode: 'approved', startTime: '10:00', endTime: '12:00', purpose: undefined }),
          r({ id: 3, reservationDate: '2026-10-13T00:00:00Z', statusCode: 'approved' }),
          r({ id: 4, statusCode: 'cancelled', propertyUnitNumber: '300' }),
        ]}
        onSelect={onSelect}
      />,
    );

    const friday = screen.getByRole('gridcell', { name: 'Reservas del 2026-10-16' });
    const block = within(friday).getByRole('button', { name: 'BBQ, Casa 126, 14:00 a 18:00, Pendiente' });
    expect(block).toHaveTextContent('Casa 126 · Cumpleaños');
    expect(block.style.boxShadow).toContain('3.5px');
    const saturday = within(screen.getByRole('gridcell', { name: 'Reservas del 2026-10-17' })).getByRole('button', { name: 'Salón, Dúplex 7, 10:00 a 12:00, Aprobada' });
    expect(saturday.style.background).toBe('rgb(26, 26, 26)');
    expect(within(screen.getByRole('gridcell', { name: 'Reservas del 2026-10-13' })).getByRole('button', { name: /Pasada$/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Casa 300/ })).not.toBeInTheDocument();

    await userEvent.click(block);
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('encabezado mono con hoy resaltado y horas de 08:00 a 22:00', () => {
    render(<WeekCalendar days={weekDays('2026-10-12')} today="2026-10-15" schedules={[]} reservations={[]} onSelect={vi.fn()} />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(8);
    expect(headers[4]).toHaveAttribute('aria-current', 'date');
    expect(within(headers[4]).getByText('15').className).toContain('text-[#c8603f]');
    expect(screen.getByText('08:00')).toBeInTheDocument();
    expect(screen.getByText('22:00')).toBeInTheDocument();
  });
});
