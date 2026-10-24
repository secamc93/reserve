import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import { ProductTour, placeCard, visibleSteps, type TourStep } from './product-tour';
import { VOTING_TOUR_KEY, VotingTour, votingTourSeen } from './voting-tour';

const steps: TourStep[] = [
  { id: 'a', title: 'Bienvenida', body: 'Hola' },
  { id: 'b', target: '#boton', missing: 'skip', title: 'El botón', body: 'Aquí se crea' },
  { id: 'c', target: '#no-existe', missing: 'skip', title: 'No está', body: '—' },
  { id: 'd', title: 'Fin', body: 'Listo' },
];

function addTarget() {
  const el = document.createElement('button');
  el.id = 'boton';
  el.getBoundingClientRect = () => ({ top: 100, left: 200, width: 120, height: 40, right: 320, bottom: 140, x: 200, y: 100, toJSON: () => ({}) });
  el.scrollIntoView = vi.fn();
  document.body.appendChild(el);
  return el;
}

describe('ProductTour', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
  });

  it('salta los pasos cuyo elemento no está en pantalla', () => {
    addTarget();
    const shown = visibleSteps(steps, (s) => !!s.target && !!document.querySelector(s.target));
    expect(shown.map((s) => s.id)).toEqual(['a', 'b', 'd']);
  });

  it('pone la tarjeta debajo del elemento si cabe, arriba si no, y dentro de la ventana', () => {
    expect(placeCard({ top: 100, left: 200, width: 120, height: 40 }, 200, 1280, 720).top).toBe(100 + 40 + 8 + 14);
    expect(placeCard({ top: 600, left: 200, width: 120, height: 40 }, 200, 1280, 720).top).toBe(600 - 8 - 14 - 200);
    expect(placeCard({ top: 100, left: 1250, width: 20, height: 20 }, 200, 1280, 720).left).toBe(1280 - 360 - 16);
    expect(placeCard(null, 200, 1280, 720)).toEqual({ top: 260, left: 460 });
  });

  it('avanza, retrocede y termina con la acción final', async () => {
    addTarget();
    const onClose = vi.fn();
    const onFinish = vi.fn();
    render(<ProductTour steps={steps} open onClose={onClose} onFinish={onFinish} finishLabel="Crear mi asamblea" />);
    const user = userEvent.setup();
    expect(screen.getByRole('heading', { name: 'Bienvenida' })).toBeInTheDocument();
    expect(screen.getByText('Paso 1 de 3')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    expect(screen.getByRole('heading', { name: 'El botón' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Atrás' }));
    expect(screen.getByRole('heading', { name: 'Bienvenida' })).toBeInTheDocument();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByRole('heading', { name: 'Fin' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Crear mi asamblea' }));
    expect(onClose).toHaveBeenCalled();
    expect(onFinish).toHaveBeenCalled();
  });

  it('Esc o "Saltar recorrido" lo cierran', async () => {
    const onClose = vi.fn();
    render(<ProductTour steps={steps} open onClose={onClose} />);
    const user = userEvent.setup();
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('button', { name: 'Saltar recorrido' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('VotingTour', () => {
  beforeEach(() => localStorage.clear());

  it('al cerrarlo queda visto y no vuelve a abrirse solo', async () => {
    expect(votingTourSeen()).toBe(false);
    const onClose = vi.fn();
    render(<VotingTour open onClose={onClose} onCreateGroup={vi.fn()} hasGroups={false} />);
    expect(screen.getByRole('dialog', { name: 'Recorrido guiado de votaciones' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Así se hace una votación de asamblea' })).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Saltar recorrido' }));
    expect(onClose).toHaveBeenCalled();
    expect(localStorage.getItem(VOTING_TOUR_KEY)).toBe('done');
    expect(votingTourSeen()).toBe(true);
  });

  it('sin asambleas, el último paso abre el formulario para crear la primera', async () => {
    const onCreateGroup = vi.fn();
    render(<VotingTour open onClose={vi.fn()} onCreateGroup={onCreateGroup} hasGroups={false} />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Empezar' }));
    await user.click(screen.getByRole('button', { name: 'Crear mi asamblea' }));
    expect(onCreateGroup).toHaveBeenCalled();
  });
});
