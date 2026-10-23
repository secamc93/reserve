import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = vi.hoisted(() => ({ getVotingsAction: vi.fn(), getVotingCoverageAction: vi.fn(), getVotingDetailsAction: vi.fn() }));
vi.mock('../../infrastructure/actions', () => actions);
const attendance = vi.hoisted(() => ({ listAttendanceListsAction: vi.fn(), getAttendanceListSummaryAction: vi.fn() }));
vi.mock('../../../attendance/infrastructure/actions', () => attendance);
vi.mock('@shared/config', () => ({ TokenStorage: { getBusinessToken: () => 'T' } }));
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import { VotingGuide, activeGroup } from './voting-guide';
import type { VotingGroup } from '../../domain/entities';

const group = (over: Partial<VotingGroup> = {}): VotingGroup => ({
  id: 7, businessId: 1, name: 'Asamblea ordinaria', description: '', votingStartDate: '2020-01-01T00:00:00Z', votingEndDate: '2999-01-01T00:00:00Z',
  isActive: true, requiresQuorum: true, quorumPercentage: 51, requireDocumentValidation: false, createdByUserId: 1, createdAt: '', updatedAt: '', ...over,
});

const noCoverage = { success: true, data: { businessId: 1, today: '2026-10-23', todayCovered: false, propertyExempt: false, adminExempt: false, membership: null, purchasedDates: [], assemblies: [], pricePerDayCop: 50000, gatewayEnabled: true, recentPurchases: [] } };

describe('VotingGuide', () => {
  beforeEach(() => {
    localStorage.clear();
    [...Object.values(actions), ...Object.values(attendance)].forEach((a) => a.mockReset());
    actions.getVotingCoverageAction.mockResolvedValue(noCoverage);
    actions.getVotingsAction.mockResolvedValue({ success: true, data: [] });
    attendance.listAttendanceListsAction.mockResolvedValue({ success: true, data: [] });
  });

  it('sin asambleas propone crear la primera y abre el formulario', async () => {
    const onCreate = vi.fn();
    render(<VotingGuide businessId={1} groups={[]} onCreateGroup={onCreate} onOpenGroup={vi.fn()} />);
    const guide = await screen.findByRole('region', { name: 'Guía de votaciones' });
    expect(within(guide).getByText('0/5')).toBeInTheDocument();
    await userEvent.click(within(guide).getByRole('button', { name: 'Crear asamblea' }));
    expect(onCreate).toHaveBeenCalled();
  });

  it('marca hechos los pasos con los datos de la asamblea en curso', async () => {
    actions.getVotingsAction.mockResolvedValue({ success: true, data: [{ id: 1, isActive: false }] });
    actions.getVotingDetailsAction.mockResolvedValue({ success: true, data: { units: [{ has_voted: false }] } });
    attendance.listAttendanceListsAction.mockResolvedValue({ success: true, data: [{ id: 3 }, { id: 9 }] });
    attendance.getAttendanceListSummaryAction.mockResolvedValue({ success: true, data: { attended_units: 4 } });
    actions.getVotingCoverageAction.mockResolvedValue({ ...noCoverage, data: { ...noCoverage.data, propertyExempt: true } });

    render(<VotingGuide businessId={1} groups={[group()]} onCreateGroup={vi.fn()} onOpenGroup={vi.fn()} />);
    expect(await screen.findByText('4/5')).toBeInTheDocument();
    expect(attendance.getAttendanceListSummaryAction).toHaveBeenCalledWith({ token: 'T', id: 9 });
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('Vota en vivo');
  });

  it('cuenta como cerrada solo la votación inactiva que recibió votos', async () => {
    actions.getVotingsAction.mockResolvedValue({ success: true, data: [{ id: 1, isActive: false }, { id: 2, isActive: false }] });
    actions.getVotingDetailsAction.mockImplementation(async ({ votingId }: { votingId: number }) => ({ success: true, data: { units: [{ has_voted: votingId === 2 }] } }));
    render(<VotingGuide businessId={1} groups={[group()]} onCreateGroup={vi.fn()} onOpenGroup={vi.fn()} />);
    expect(await screen.findByText('3/5')).toBeInTheDocument();
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('Asistencia y QR');
  });

  it('abre el video del paso', async () => {
    render(<VotingGuide businessId={1} groups={[]} onCreateGroup={vi.fn()} onOpenGroup={vi.fn()} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Ver video: Agrega las votaciones' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog.querySelector('video')?.getAttribute('src')).toBe('/tutoriales/agregar-votaciones.mp4');
  });

  it('se puede ocultar y lo recuerda por propiedad', async () => {
    const { unmount } = render(<VotingGuide businessId={1} groups={[]} onCreateGroup={vi.fn()} onOpenGroup={vi.fn()} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Ocultar guía' }));
    expect(screen.queryByRole('region', { name: 'Guía de votaciones' })).not.toBeInTheDocument();
    unmount();
    render(<VotingGuide businessId={1} groups={[]} onCreateGroup={vi.fn()} onOpenGroup={vi.fn()} />);
    await userEvent.click(await screen.findByRole('button', { name: /¿Cómo funciona\?/ }));
    expect(screen.getByRole('region', { name: 'Guía de votaciones' })).toBeInTheDocument();
  });

  it('la asamblea en curso es la primera no cerrada', () => {
    const closed = group({ id: 1, votingEndDate: '2001-01-01T00:00:00Z' });
    expect(activeGroup([closed, group({ id: 2 })])?.id).toBe(2);
    expect(activeGroup([closed])?.id).toBe(1);
    expect(activeGroup([])).toBeNull();
  });
});
