import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = vi.hoisted(() => ({
  getVotingDetailsAction: vi.fn(),
  getVotingOptionsAction: vi.fn(),
  activateVotingAction: vi.fn(),
}));
vi.mock('../infrastructure/actions', () => ({
  getVotingDetailsAction: actions.getVotingDetailsAction,
  getVotingOptionsAction: actions.getVotingOptionsAction,
}));
vi.mock('../infrastructure/actions/activate-voting.action', () => ({ activateVotingAction: actions.activateVotingAction }));
vi.mock('../infrastructure/actions/deactivate-voting.action', () => ({ deactivateVotingAction: vi.fn() }));
const report = vi.hoisted(() => ({ save: vi.fn(), build: vi.fn() }));
vi.mock('./report/voting-report-pdf', async (orig) => ({
  ...(await orig<typeof import('./report/voting-report-pdf')>()),
  buildVotingReportPdf: report.build,
}));
vi.mock('@shared/config', () => ({ TokenStorage: { getBusinessToken: () => 'T' } }));
// next/font solo funciona compilado por Next.
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import { VotingsList } from './votings-list';
import type { Voting } from '../domain/entities';

const voting = (id: number, isActive: boolean): Voting => ({
  id,
  votingGroupId: 2,
  title: `Punto ${id}`,
  description: '',
  votingType: 'simple',
  isSecret: false,
  allowAbstention: true,
  isActive,
  displayOrder: id,
  requiredPercentage: 50,
  createdAt: '',
  updatedAt: '',
});

const renderIt = (canViewLive: boolean, votings: Voting[], onReload = vi.fn(), canManage = true) =>
  render(
    <VotingsList businessId={1} groupId={2} groupName="Asamblea" votings={votings} onReload={onReload} canViewLive={canViewLive} canManage={canManage} />,
  );

describe('VotingsList: panel en vivo según el rol', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.getVotingOptionsAction.mockResolvedValue({ success: true, data: [{ id: 1, optionText: 'Sí', optionCode: 'si', displayOrder: 1, isActive: true }] });
    actions.getVotingDetailsAction.mockResolvedValue({ success: true, data: { units: [] } });
    actions.activateVotingAction.mockResolvedValue({ success: true });
  });

  it('con el recurso, una votación abierta muestra "En vivo"', async () => {
    renderIt(true, [voting(1, true)]);
    expect(await screen.findByRole('button', { name: /En vivo: Punto 1/ })).toBeInTheDocument();
  });

  it('sin el recurso (consejero) no muestra "En vivo"', async () => {
    renderIt(false, [voting(1, true)]);
    await waitFor(() => expect(actions.getVotingOptionsAction).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: /En vivo/ })).not.toBeInTheDocument();
  });

  it('sin el recurso, "Iniciar" abre la votación y recarga la lista sin ir al panel', async () => {
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    const onReload = vi.fn();
    renderIt(false, [voting(3, false)], onReload);
    await userEvent.click(await screen.findByRole('button', { name: /Iniciar: Punto 3/ }));
    await waitFor(() => expect(onReload).toHaveBeenCalled());
    expect(actions.activateVotingAction).toHaveBeenCalledWith(expect.objectContaining({ votingId: 3 }));
    expect(assign).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('un consejero (solo ver) no crea, no inicia ni edita votaciones; solo "Ver votos"', async () => {
    renderIt(false, [voting(1, true), voting(3, false)], vi.fn(), false);
    await waitFor(() => expect(actions.getVotingOptionsAction).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('button', { name: /Nueva votación/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Iniciar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /En vivo/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Más acciones de Punto 1' }));
    expect(screen.getByRole('menuitem', { name: 'Ver votos' })).toBeInTheDocument();
    expect(screen.queryByRole('menuitem', { name: /Editar|Eliminar|Cerrar|Abrir/ })).not.toBeInTheDocument();
  });

  it('el menú de acciones se abre fuera de la fila: la tarjeta del grupo (overflow-hidden) no lo recorta', async () => {
    renderIt(true, [voting(1, true), voting(3, false)], vi.fn());
    await waitFor(() => expect(actions.getVotingOptionsAction).toHaveBeenCalledTimes(2));
    await userEvent.click(screen.getByRole('button', { name: 'Más acciones de Punto 3' }));
    const menu = screen.getByRole('menu', { name: 'Más acciones de Punto 3' });
    expect(screen.getByRole('listitem', { name: 'Punto 3' })).not.toContainElement(menu);
    expect(menu.parentElement).toBe(document.body);
    expect(screen.getByRole('menuitem', { name: 'Editar votación y opciones' })).toBeInTheDocument();
  });

  it('"Informe PDF" lee todas las votaciones del grupo, en orden, y descarga el informe', async () => {
    report.build.mockResolvedValue({ save: report.save });
    actions.getVotingDetailsAction.mockResolvedValue({ success: true, data: { units: [], total_units: 0, units_voted: 0, units_pending: 0 } });
    renderIt(false, [voting(3, false), voting(1, true)], vi.fn(), false);
    await userEvent.click(screen.getByRole('button', { name: 'Informe PDF' }));
    await waitFor(() => expect(report.save).toHaveBeenCalledWith('informe-votaciones-asamblea.pdf'));
    const input = report.build.mock.calls[0][0];
    expect(input.groupName).toBe('Asamblea');
    expect(input.votings.map((v: { title: string }) => v.title)).toEqual(['Punto 1', 'Punto 3']);
  });
});
