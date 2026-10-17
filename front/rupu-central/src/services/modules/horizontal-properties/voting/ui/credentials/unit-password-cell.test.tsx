import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// next/font solo funciona compilado por Next.
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import { UnitPasswordCell } from './unit-password-cell';

describe('Contraseña de la unidad en la asistencia', () => {
  it('está oculta hasta que se pide; al desbloquear la muestra y se puede volver a ocultar', async () => {
    const load = vi.fn().mockResolvedValue('K7M2QX');
    render(<UnitPasswordCell unitLabel="Casa 12" load={load} unlockMs={0} />);

    expect(screen.queryByText('K7M2QX')).not.toBeInTheDocument();
    expect(load).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Ver contraseña de Casa 12' }));
    expect(await screen.findByText('K7M2QX')).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña de Casa 12' }));
    expect(screen.queryByText('K7M2QX')).not.toBeInTheDocument();
  });

  it('se oculta sola después de un rato', async () => {
    render(<UnitPasswordCell unitLabel="Casa 12" load={vi.fn().mockResolvedValue('K7M2QX')} unlockMs={0} revealMs={50} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ver contraseña de Casa 12' }));
    expect(await screen.findByText('K7M2QX')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('K7M2QX')).not.toBeInTheDocument());
  });

  it('avisa si la unidad no tiene contraseña', async () => {
    render(<UnitPasswordCell unitLabel="Casa 12" load={vi.fn().mockResolvedValue(null)} unlockMs={0} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ver contraseña de Casa 12' }));
    expect(await screen.findByText('Sin contraseña')).toBeInTheDocument();
  });
});
