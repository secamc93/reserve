import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = vi.hoisted(() => ({
  assignRecordProxyAction: vi.fn(),
  removeRecordProxyAction: vi.fn(),
}));
vi.mock('../../attendance/infrastructure/actions', () => actions);
// next/font solo funciona compilado por Next.
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import { AttendanceProxyDialog } from './attendance-proxy-dialog';
import type { AttendanceRow } from './design';

const row = (proxyName = ''): AttendanceRow => ({
  recordId: 900,
  unitId: 126,
  unitNumber: '126',
  unitNo: '126',
  residentName: 'ROJAS BELTRAN CAROLINA',
  proxyName,
  present: false,
  byProxy: false,
  coefPct: 0.55,
});

describe('Apoderado en la asistencia', () => {
  beforeEach(() => vi.clearAllMocks());

  it('guarda nombre y documento y devuelve la unidad presente como apoderado', async () => {
    const saved = { id: 900, propertyUnitId: 126, proxyId: 5, proxyName: 'Ana Pérez', attendedAsOwner: false, attendedAsProxy: true };
    actions.assignRecordProxyAction.mockResolvedValue({ success: true, data: saved });
    const onSaved = vi.fn();
    render(<AttendanceProxyDialog row={row()} token="T" onClose={vi.fn()} onSaved={onSaved} />);

    expect(screen.getByRole('heading', { name: 'Agregar apoderado' })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Nombre del apoderado'), 'Ana Pérez');
    await userEvent.type(screen.getByLabelText('Documento (opcional)'), '1020');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({ unitId: 126 }), saved));
    expect(actions.assignRecordProxyAction).toHaveBeenCalledWith({ token: 'T', recordId: 900, proxyName: 'Ana Pérez', proxyDni: '1020' });
  });

  it('sin nombre no llama al back y avisa', async () => {
    render(<AttendanceProxyDialog row={row()} token="T" onClose={vi.fn()} onSaved={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Escribe el nombre del apoderado.')).toBeInTheDocument();
    expect(actions.assignRecordProxyAction).not.toHaveBeenCalled();
  });

  it('quita el apoderado existente', async () => {
    const cleared = { id: 900, propertyUnitId: 126, proxyId: null, proxyName: '', attendedAsOwner: false, attendedAsProxy: false };
    actions.removeRecordProxyAction.mockResolvedValue({ success: true, data: cleared });
    const onSaved = vi.fn();
    render(<AttendanceProxyDialog row={row('Ana Pérez')} token="T" onClose={vi.fn()} onSaved={onSaved} />);

    expect(screen.getByLabelText('Nombre del apoderado')).toHaveValue('Ana Pérez');
    await userEvent.click(screen.getByRole('button', { name: 'Quitar apoderado' }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(expect.anything(), cleared));
    expect(actions.removeRecordProxyAction).toHaveBeenCalledWith({ token: 'T', recordId: 900 });
  });

  it('muestra el error del back', async () => {
    actions.assignRecordProxyAction.mockResolvedValue({ success: false, error: 'Registro de asistencia no encontrado' });
    render(<AttendanceProxyDialog row={row()} token="T" onClose={vi.fn()} onSaved={vi.fn()} />);
    await userEvent.type(screen.getByLabelText('Nombre del apoderado'), 'Ana');
    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Registro de asistencia no encontrado')).toBeInTheDocument();
  });
});
