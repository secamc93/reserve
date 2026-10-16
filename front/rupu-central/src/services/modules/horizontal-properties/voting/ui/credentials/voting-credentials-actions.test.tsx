import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const actions = vi.hoisted(() => ({
  generateVotingCredentialsAction: vi.fn(),
  listVotingCredentialsAction: vi.fn(),
}));
const urlAction = vi.hoisted(() => ({ generateGroupPublicUrlAction: vi.fn() }));
const pdf = vi.hoisted(() => ({ save: vi.fn(), build: vi.fn() }));

vi.mock('../../infrastructure/actions/voting-credentials.action', () => actions);
vi.mock('../../infrastructure/actions/public-voting/generate-group-public-url.action', () => urlAction);
vi.mock('qrcode', () => ({ default: { toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,AAA') } }));
vi.mock('./credentials-pdf', () => ({ buildCredentialsPdf: pdf.build }));
// next/font solo funciona compilado por Next.
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import { VotingCredentialsActions } from './voting-credentials-actions';

const renderIt = () => render(<VotingCredentialsActions token="T" businessId={1} groupId={9} />);

describe('Contraseñas de voto en la lista de asistencia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    pdf.build.mockResolvedValue({ save: pdf.save });
  });

  it('genera las contraseñas que faltan y lo informa', async () => {
    actions.generateVotingCredentialsAction.mockResolvedValue({ success: true, data: { generated: 194, total: 194 } });
    renderIt();
    await userEvent.click(screen.getByRole('button', { name: /Generar contraseñas/ }));
    expect(await screen.findByText(/Se generaron 194 contraseñas/)).toBeInTheDocument();
    expect(actions.generateVotingCredentialsAction).toHaveBeenCalledWith({ token: 'T', businessId: 1, groupId: 9, regenerate: false });
  });

  it('si ya todas tienen contraseña, regenerar pide confirmación', async () => {
    actions.generateVotingCredentialsAction
      .mockResolvedValueOnce({ success: true, data: { generated: 0, total: 194 } })
      .mockResolvedValueOnce({ success: true, data: { generated: 194, total: 194 } });
    renderIt();
    await userEvent.click(screen.getByRole('button', { name: /Generar contraseñas/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Regenerar todas' }));
    expect(await screen.findByText(/Se regeneraron las 194 contraseñas/)).toBeInTheDocument();
    expect(actions.generateVotingCredentialsAction).toHaveBeenLastCalledWith({ token: 'T', businessId: 1, groupId: 9, regenerate: true });
  });

  it('el PDF lleva una tarjeta por unidad con el QR del grupo', async () => {
    const credentials = [
      { propertyUnitId: 1, unitNumber: '126', unitBlock: 'Casa', ownerName: 'CAMACHO MATEUS SEBASTIAN', password: 'K7M2QX' },
    ];
    actions.listVotingCredentialsAction.mockResolvedValue({
      success: true,
      data: { credentials, total: 1, page: 1, pageSize: 200, totalPages: 1 },
    });
    urlAction.generateGroupPublicUrlAction.mockResolvedValue({
      success: true,
      data: { public_url: 'https://rupü.com/public/vote?token=x', group_name: 'Asamblea 2026' },
    });
    renderIt();
    await userEvent.click(screen.getByRole('button', { name: /Descargar PDF con QR/ }));
    await waitFor(() => expect(pdf.save).toHaveBeenCalledWith('credenciales-asamblea-2026.pdf'));
    expect(pdf.build).toHaveBeenCalledWith(expect.objectContaining({
      groupName: 'Asamblea 2026',
      publicUrl: 'https://rupü.com/public/vote?token=x',
      cards: credentials,
    }));
    // El QR impreso dura lo suficiente para entregarlo antes de la asamblea.
    expect(urlAction.generateGroupPublicUrlAction.mock.calls[0][0].durationHours).toBeGreaterThanOrEqual(24 * 7);
  });

  it('sin contraseñas generadas no arma el PDF', async () => {
    actions.listVotingCredentialsAction.mockResolvedValue({
      success: true,
      data: { credentials: [], total: 0, page: 1, pageSize: 200, totalPages: 0 },
    });
    renderIt();
    await userEvent.click(screen.getByRole('button', { name: /Descargar PDF con QR/ }));
    expect(await screen.findByText('Primero genere las contraseñas del grupo.')).toBeInTheDocument();
    expect(pdf.build).not.toHaveBeenCalled();
  });
});
