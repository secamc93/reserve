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
  });

  it('valida antes de enviar y crea con los valores convertidos', async () => {
    const onSaved = vi.fn();
    actions.createCommonAreaAction.mockResolvedValue({ success: true, data: { id: 9, name: 'BBQ Norte' } });
    render(<AreaFormModal open businessId={1} areaId={null} getToken={getToken} onClose={vi.fn()} onSaved={onSaved} />);

    const name = await screen.findByLabelText('Nombre');
    expect(screen.getByRole('dialog', { name: 'Nueva zona' })).toBeInTheDocument();
    // El primer tipo propone su capacidad
    expect(screen.getByLabelText('Capacidad (personas)')).toHaveValue(15);

    await userEvent.click(screen.getByRole('button', { name: 'Crear zona' }));
    expect(await screen.findByText('El nombre es obligatorio')).toBeInTheDocument();
    expect(actions.createCommonAreaAction).not.toHaveBeenCalled();

    await userEvent.type(name, 'BBQ Norte');
    await userEvent.type(screen.getByLabelText('Tarifa por hora (COP)'), '30.000');
    await userEvent.click(screen.getByRole('switch', { name: 'Cobra depósito' }));
    await userEvent.click(screen.getByRole('button', { name: 'Crear zona' }));
    expect(await screen.findByText('Indica el valor del depósito')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('Valor del depósito (COP)'), '100.000');
    await userEvent.click(screen.getByRole('button', { name: 'Crear zona' }));

    await waitFor(() => expect(actions.createCommonAreaAction).toHaveBeenCalled());
    expect(actions.createCommonAreaAction.mock.calls[0][0]).toMatchObject({
      token: 'T',
      businessId: 1,
      data: { commonAreaTypeId: 3, name: 'BBQ Norte', maxCapacity: 15, hourlyRate: 30000, requiresDeposit: true, depositAmount: 100000, requiresApproval: true },
    });
    expect(onSaved).toHaveBeenCalledWith(expect.stringContaining('BBQ Norte'));
  });

  it('edita una zona existente y permite desactivarla', async () => {
    actions.getCommonAreaByIdAction.mockResolvedValue({
      success: true,
      data: { id: 4, businessId: 1, commonAreaTypeId: 5, name: 'Piscina', maxCapacity: 30, hasEquipment: false, requiresApproval: false, requiresDeposit: false, allowsRecurring: false, isActive: true, createdAt: '', updatedAt: '' },
    });
    actions.updateCommonAreaAction.mockResolvedValue({ success: true, data: { id: 4, name: 'Piscina' } });
    render(<AreaFormModal open businessId={1} areaId={4} getToken={getToken} onClose={vi.fn()} onSaved={vi.fn()} />);

    await waitFor(() => expect(screen.getByLabelText('Nombre')).toHaveValue('Piscina'));
    expect(screen.getByLabelText('Tipo de zona')).toHaveValue('5');
    await userEvent.click(screen.getByRole('switch', { name: 'Zona activa' }));
    await userEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(actions.updateCommonAreaAction).toHaveBeenCalled());
    expect(actions.updateCommonAreaAction.mock.calls[0][0]).toMatchObject({ id: 4, businessId: 1, data: { isActive: false, commonAreaTypeId: 5 } });
  });

  it('muestra el error del servidor', async () => {
    actions.createCommonAreaAction.mockResolvedValue({ success: false, error: 'Ya existe una zona con ese nombre' });
    render(<AreaFormModal open businessId={1} areaId={null} getToken={getToken} onClose={vi.fn()} onSaved={vi.fn()} />);
    await userEvent.type(await screen.findByLabelText('Nombre'), 'BBQ');
    await userEvent.click(screen.getByRole('button', { name: 'Crear zona' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe una zona con ese nombre');
  });
});
