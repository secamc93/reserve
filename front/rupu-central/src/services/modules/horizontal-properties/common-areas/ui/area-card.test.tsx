import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-public-sans', className: 'font-public-sans' }),
  JetBrains_Mono: () => ({ variable: 'font-jetbrains', className: 'font-jetbrains' }),
}));

import { AreaCard } from './area-card';
import type { CommonAreaListDTO } from '../domain';

const area: CommonAreaListDTO = {
  id: 4,
  name: 'Salón comunal',
  typeName: 'Salón social',
  location: 'Junto a portería',
  maxCapacity: 40,
  areaSqm: 120,
  hasEquipment: true,
  equipmentDescription: 'Sonido',
  hourlyRate: 30000,
  requiresDeposit: true,
  depositAmount: 200000,
  allowsRecurring: false,
  isActive: true,
  requiresApproval: true,
  schedules: [1, 2, 3, 4, 5].map((d) => ({ dayOfWeek: d, startTime: '08:00', endTime: '22:00', isActive: true })),
};

const handlers = () => ({ onEdit: vi.fn(), onSchedule: vi.fn(), onToggleActive: vi.fn(), onDelete: vi.fn() });

describe('Tarjeta de zona (Z1)', () => {
  it('muestra capacidad, reglas y horario', () => {
    render(<AreaCard area={area} reservationsHref="/x" {...handlers()} />);
    const card = screen.getByRole('article', { name: 'Salón comunal' });
    expect(within(card).getByText('40')).toBeInTheDocument();
    expect(within(card).getByText('Activa')).toBeInTheDocument();
    const rules = within(card).getByRole('list', { name: 'Reglas de Salón comunal' });
    expect(within(rules).getByText('Requiere aprobación')).toBeInTheDocument();
    expect(within(rules).getByText(/30\.000 \/ hora/)).toBeInTheDocument();
    expect(within(rules).getByText(/Depósito .*200\.000/)).toBeInTheDocument();
    expect(within(rules).getByText('Equipada · Sonido')).toBeInTheDocument();
    expect(within(card).getByText('Lun–Vie 08:00–22:00')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Ver reservas' })).toHaveAttribute('href', '/x');
  });

  it('sin horario avisa que no se puede reservar', () => {
    render(<AreaCard area={{ ...area, schedules: [] }} reservationsHref="/x" {...handlers()} />);
    expect(screen.getByText('Sin horario · no se puede reservar')).toBeInTheDocument();
  });

  it('editar y el menú llaman sus acciones', async () => {
    const h = handlers();
    render(<AreaCard area={area} reservationsHref="/x" {...h} />);
    await userEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(h.onEdit).toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Más acciones de Salón comunal' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Horario y bloqueos' }));
    expect(h.onSchedule).toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Más acciones de Salón comunal' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Desactivar zona' }));
    expect(h.onToggleActive).toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Más acciones de Salón comunal' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Eliminar zona' }));
    expect(h.onDelete).toHaveBeenCalled();
  });
});
