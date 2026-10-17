import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = vi.hoisted(() => ({
  createVotingAction: vi.fn(),
  createVotingOptionAction: vi.fn(),
  deleteVotingOptionAction: vi.fn(),
  getVotingOptionsAction: vi.fn(),
  updateVotingAction: vi.fn(),
  updateVotingOptionStatusAction: vi.fn(),
}));
vi.mock('../infrastructure/actions', () => actions);
vi.mock('../infrastructure/actions/deactivate-voting.action', () => ({ deactivateVotingAction: vi.fn() }));
vi.mock('@shared/config', () => ({ TokenStorage: { getBusinessToken: () => 'T' } }));
// next/font solo funciona compilado por Next.
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import { VotingFormModal } from './voting-form-modal';
import type { Voting } from '../domain/entities';

const voting: Voting = {
  id: 6,
  votingGroupId: 2,
  title: 'Punto 3. Lectura y aprobación del orden del día',
  description: '¿Aprueba el orden del día propuesto en la convocatoria?',
  votingType: 'majority',
  isSecret: false,
  allowAbstention: true,
  isActive: false,
  displayOrder: 3,
  requiredPercentage: 50,
  createdAt: '',
  updatedAt: '',
};

describe('Editar votación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actions.getVotingOptionsAction.mockResolvedValue({
      success: true,
      data: [
        { id: 1, votingId: 6, optionText: 'Sí', optionCode: 'SI', displayOrder: 1, isActive: true, color: '#16a34a' },
        { id: 2, votingId: 6, optionText: 'No', optionCode: 'NO', displayOrder: 2, isActive: true, color: '#dc2626' },
      ],
    });
    actions.updateVotingAction.mockResolvedValue({ success: true, data: voting });
  });

  it('conserva el orden de la votación al guardar (el back lo exige)', async () => {
    const onSuccess = vi.fn();
    render(
      <VotingFormModal isOpen onClose={vi.fn()} onSuccess={onSuccess} businessId={1} groupId={2} groupName="Asamblea" nextOrder={9} voting={voting} />
    );
    await screen.findByText('SI');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar votación' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(actions.updateVotingAction).toHaveBeenCalledWith(
      expect.objectContaining({ votingId: 6, data: expect.objectContaining({ displayOrder: 3 }) })
    );
  });
});
