import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = vi.hoisted(() => ({
  getPropertyUnitsForPublicVotingAction: vi.fn(),
  validateResidentAction: vi.fn(),
}));
vi.mock('@/services/modules/horizontal-properties/voting/infrastructure/actions/public-voting', () => actions);
// next/font solo funciona compilado por Next.
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-public-sans', className: 'font-public-sans' }),
  JetBrains_Mono: () => ({ variable: 'font-jetbrains', className: 'font-jetbrains' }),
}));

import { PublicVotingValidation } from './public-voting-validation';

const context = (requireDocument?: boolean) => ({
  property: { id: 1, name: 'Tayazal de Suba', address: '' },
  voting: null,
  voting_group: { id: 9, name: 'Asamblea 2026', description: '' },
  is_group_token: true,
  ...(requireDocument === undefined ? {} : { require_document_validation: requireDocument }),
});

const okResult = {
  success: true,
  status: 200,
  data: {
    resident_id: 0, resident_name: 'Unidad T2-102', property_unit_id: 41, property_unit_number: 'T2-102',
    voting_auth_token: 'VAT', hp_id: 1, voting_group_id: 9, is_group_token: true, require_document_validation: false,
  },
};

async function chooseUnit(user: ReturnType<typeof userEvent.setup>) {
  const input = screen.getByLabelText('Tu unidad');
  await waitFor(() => expect(input).toBeEnabled());
  await user.type(input, 'T2-1');
  await user.click(await screen.findByRole('option', { name: /T2-102/ }));
}

describe('R1 · identificación según la configuración del grupo', () => {
  beforeEach(() => {
    actions.getPropertyUnitsForPublicVotingAction.mockResolvedValue({
      success: true,
      data: { units: [{ id: 41, number: 'T2-102' }, { id: 42, number: 'T2-201' }] },
    });
    actions.validateResidentAction.mockReset();
  });

  it('grupo SIN documento (o bandera ausente): solo se elige la unidad y "Continuar" valida sin dni', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    actions.validateResidentAction.mockResolvedValue(okResult);
    render(<PublicVotingValidation publicToken="PT" votingContext={context()} onSuccess={onSuccess} onError={vi.fn()} />);

    expect(screen.queryByLabelText('Documento de identidad')).not.toBeInTheDocument();
    await chooseUnit(user);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(actions.validateResidentAction).toHaveBeenCalledWith({ publicToken: 'PT', propertyUnitId: 41 });
    expect(onSuccess.mock.calls[0][0]).toBe('VAT');
    expect(onSuccess.mock.calls[0][1]).toMatchObject({ name: 'Unidad T2-102', unitNumber: 'T2-102', groupId: 9 });
  });

  it('grupo CON documento: el campo es obligatorio y se envía', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    actions.validateResidentAction.mockResolvedValue(okResult);
    render(<PublicVotingValidation publicToken="PT" votingContext={context(true)} onSuccess={onSuccess} onError={vi.fn()} />);

    await chooseUnit(user);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(await screen.findByText('Escribe tu documento de identidad')).toBeInTheDocument();
    expect(actions.validateResidentAction).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Documento de identidad'), '90.000 41');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(actions.validateResidentAction).toHaveBeenCalledWith({ publicToken: 'PT', propertyUnitId: 41, dni: '9000041' });
  });

  it('si el back responde 400 "Documento requerido", aparece el campo de documento', async () => {
    const user = userEvent.setup();
    actions.validateResidentAction.mockResolvedValueOnce({ success: false, status: 400, message: 'Documento requerido' });
    render(<PublicVotingValidation publicToken="PT" votingContext={context(false)} onSuccess={vi.fn()} onError={vi.fn()} />);

    await chooseUnit(user);
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(await screen.findByText(/exige tu documento de identidad/)).toBeInTheDocument();
    expect(screen.getByLabelText('Documento de identidad')).toBeInTheDocument();
  });

  it('documento que no coincide: mensaje claro y no avanza', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    actions.validateResidentAction.mockResolvedValue({ success: false, status: 404, message: 'Residente no encontrado' });
    render(<PublicVotingValidation publicToken="PT" votingContext={context(true)} onSuccess={onSuccess} onError={vi.fn()} />);

    await chooseUnit(user);
    await user.type(screen.getByLabelText('Documento de identidad'), '111');
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    expect(await screen.findByText(/Revisa que la unidad y el documento coincidan/)).toBeInTheDocument();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
