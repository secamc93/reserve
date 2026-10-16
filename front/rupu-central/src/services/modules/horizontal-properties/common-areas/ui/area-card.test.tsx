import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-public-sans', className: 'font-public-sans' }),
  JetBrains_Mono: () => ({ variable: 'font-jetbrains', className: 'font-jetbrains' }),
}));

import { AreaCard } from './area-card';
import { weekDays } from './design';
import type { CommonAreaListDTO } from '../domain';

const area: CommonAreaListDTO = {
  id: 4,
  name: 'Salón comunal',
  typeName: 'Salón social',
  location: 'Torre B',
  maxCapacity: 40,
  hasEquipment: false,
  hourlyRate: 25000,
  requiresDeposit: true,
  depositAmount: 150000,
  allowsRecurring: false,
  isActive: true,
  requiresApproval: true,
  schedules: [],
  restrictions: [],
};
const days = weekDays('2026-10-12');
const handlers = () => ({ onOpen: vi.fn(), onEdit: vi.fn(), onSchedule: vi.fn(), onToggleActive: vi.fn(), onDelete: vi.fn() });

describe('Tarjeta de zona (Z1)', () => {
  it('muestra nombre, tipo · ubicación, estado, reglas y la semana', () => {
    render(<AreaCard area={area} today="2026-10-15" days={days} cells={['reserved', 'free', 'pending', 'free', 'closed', 'free', 'free']} summary="4 reservas" {...handlers()} />);
    const card = screen.getByRole('article', { name: 'Salón comunal' });
    expect(within(card).getByText('Salón social · Torre B')).toBeInTheDocument();
    expect(within(card).getByText('Activa')).toBeInTheDocument();
    const rules = within(card).getByRole('list', { name: 'Reglas de Salón comunal' });
    expect(within(rules).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['40 pers.', '25.000/h', 'depósito 150.000', 'aprobación']);
    expect(within(card).getByText('Esta semana')).toBeInTheDocument();
    expect(within(card).getByText('4 reservas')).toBeInTheDocument();
    expect(within(card).getByRole('img', { name: /Lun con reserva, Mar libre, Mié pendiente/ })).toBeInTheDocument();
    // Sin foto: el placeholder lleva el nombre
    expect(within(card).getByRole('button', { name: 'Ver reservas de Salón comunal' })).toHaveTextContent('Salón comunal');
  });

  it('con foto la usa; mantenimiento vigente cambia la pill', () => {
    const { container } = render(
      <AreaCard
        area={{ ...area, imageUrl: 'https://cdn/x.jpg', restrictions: [{ id: 1, commonAreaId: 4, restrictionType: 'maintenance', startDate: '2026-10-14', endDate: '2026-10-20' }] }}
        today="2026-10-15"
        days={days}
        cells={Array(7).fill('closed')}
        summary="cerrada hasta 20 oct"
        {...handlers()}
      />,
    );
    expect(container.querySelector('img')).toHaveAttribute('src', 'https://cdn/x.jpg');
    expect(screen.getByText('Mantenimiento')).toBeInTheDocument();
    expect(screen.getByText('cerrada hasta 20 oct')).toBeInTheDocument();
  });

  it('la foto abre las reservas y el menú llama sus acciones', async () => {
    const h = handlers();
    render(<AreaCard area={area} today="2026-10-15" days={days} cells={Array(7).fill('free')} summary="sin reservas" {...h} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ver reservas de Salón comunal' }));
    expect(h.onOpen).toHaveBeenCalled();
    const open = () => userEvent.click(screen.getByRole('button', { name: 'Más acciones de Salón comunal' }));
    await open();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Editar zona' }));
    await open();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Horario por día y bloqueos' }));
    await open();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Desactivar zona' }));
    await open();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Eliminar zona' }));
    expect([h.onEdit, h.onSchedule, h.onToggleActive, h.onDelete].every((f) => f.mock.calls.length === 1)).toBe(true);
  });
});
