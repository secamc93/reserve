import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

const nav = vi.hoisted(() => ({ back: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => nav }));

import { TutorialsLibrary } from './tutorials-library';

describe('TutorialsLibrary', () => {
  it('muestra los 6 apartados en el orden de una asamblea, cada uno con su video', () => {
    render(<TutorialsLibrary businessId={7} />);
    const titles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(titles).toEqual([
      'Crea la asamblea',
      'Agrega las votaciones',
      'Asistencia y voto manual',
      'Votar con QR desde el celular',
      'Vota en vivo y descarga el informe',
      'Cubre el día de votación',
    ]);
    const section = screen.getByRole('region', { name: 'Votar con QR desde el celular' });
    expect(within(section).getByLabelText('Video: Votar con QR desde el celular')).toHaveAttribute('src', '/tutoriales/credenciales-qr.mp4');
    expect(within(section).getByText('Paso 4 de 6')).toBeInTheDocument();
  });

  it('el índice salta a cada apartado y los botones llevan a hacerlo', () => {
    render(<TutorialsLibrary businessId={7} />);
    const index = screen.getByRole('navigation', { name: 'Índice de tutoriales' });
    expect(within(index).getAllByRole('link')).toHaveLength(6);
    expect(within(index).getByRole('link', { name: /Cubre el día de votación/ })).toHaveAttribute('href', '#dias-de-votacion');
    const days = screen.getByRole('region', { name: 'Cubre el día de votación' });
    expect(within(days).getByRole('link', { name: 'Ver planes' })).toHaveAttribute('href', '/properties/7/voting-groups/plans');
    const first = screen.getByRole('region', { name: 'Crea la asamblea' });
    expect(within(first).getByRole('link', { name: 'Ir a Votaciones' })).toHaveAttribute('href', '/properties/7/voting-groups');
  });

  it('al reproducir un video pausa el que estaba sonando', () => {
    render(<TutorialsLibrary businessId={7} />);
    const [a, b] = screen.getAllByLabelText(/^Video:/) as HTMLVideoElement[];
    Object.defineProperty(a, 'paused', { value: false, configurable: true });
    const pause = vi.spyOn(a, 'pause').mockImplementation(() => {});
    fireEvent.play(b);
    expect(pause).toHaveBeenCalled();
  });

  it('si un video no carga, deja el aviso y los pasos', () => {
    render(<TutorialsLibrary businessId={7} />);
    fireEvent.error(screen.getByLabelText('Video: Crea la asamblea'));
    expect(screen.getByText(/El video todavía no está disponible/)).toBeInTheDocument();
  });

  it('"Volver" regresa a la pantalla anterior', () => {
    render(<TutorialsLibrary businessId={7} />);
    Object.defineProperty(window.history, 'length', { value: 3, configurable: true });
    fireEvent.click(screen.getByRole('button', { name: '← Volver' }));
    expect(nav.back).toHaveBeenCalled();
  });
});
