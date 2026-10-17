import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// next/font solo funciona compilado por Next.
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import { AttendanceLiveScreen } from './attendance-live-screen';

const summary = { total: 194, present: 128, absent: 66, proxy: 1, presentCoefPct: 65.24 };

describe('Asistencia en vivo (pantalla grande)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 16, 20, 5, 9));
  });
  afterEach(() => vi.useRealTimers());

  it('muestra el % presente, el quórum, los conteos y la hora local', () => {
    render(<AttendanceLiveScreen groupName="Asamblea 2026" summary={summary} quorum={50} onRefresh={vi.fn()} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Asistencia en tiempo real' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Presentes 65,2% del coeficiente\. Quórum 50%/ })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Quórum alcanzado');
    expect(screen.getByText('de 194')).toBeInTheDocument();
    expect(screen.getByLabelText('Hora local 08:05:09 p. m.')).toBeInTheDocument();
  });

  it('el reloj avanza cada segundo', () => {
    render(<AttendanceLiveScreen summary={summary} quorum={50} onRefresh={vi.fn()} onClose={vi.fn()} />);
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByLabelText('Hora local 08:05:11 p. m.')).toBeInTheDocument();
  });

  it('refresca la asistencia periódicamente y avisa si falla', async () => {
    const onRefresh = vi.fn().mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('red'));
    render(<AttendanceLiveScreen summary={summary} quorum={50} onRefresh={onRefresh} onClose={vi.fn()} refreshMs={5000} />);
    expect(onRefresh).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTime(5000));
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Actualizado 08:05:14 p\. m\./)).toBeInTheDocument();
    await act(async () => vi.advanceTimersByTime(5000));
    expect(onRefresh).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/Sin conexión: los datos son de las 08:05:14 p\. m\./)).toBeInTheDocument();
  });

  it('se cierra con Esc', () => {
    const onClose = vi.fn();
    render(<AttendanceLiveScreen summary={summary} quorum={50} onRefresh={vi.fn()} onClose={onClose} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});
