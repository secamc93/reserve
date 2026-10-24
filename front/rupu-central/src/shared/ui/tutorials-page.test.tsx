import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));

import { UnitsTutorials } from '@/services/modules/horizontal-properties/units/ui/units-tutorials';
import { ResidentsTutorials } from '@/services/modules/horizontal-properties/residents/ui/residents-tutorials';

describe('tutoriales de Unidades y Residentes', () => {
  it('Unidades: importar y corregir, con su video y botón al módulo', () => {
    render(<UnitsTutorials businessId={7} />);
    expect(screen.getByRole('heading', { level: 1, name: 'Tutoriales de Unidades' })).toBeInTheDocument();
    const importar = screen.getByRole('region', { name: 'Importar unidades desde Excel' });
    expect(within(importar).getByLabelText('Video: Importar unidades desde Excel')).toHaveAttribute('src', '/tutoriales/unidades-importar.mp4');
    expect(within(importar).getByText(/deben sumar 100 %/)).toBeInTheDocument();
    expect(within(importar).getByRole('link', { name: 'Ir a Unidades' })).toHaveAttribute('href', '/properties/7/units');
    expect(screen.getByRole('region', { name: 'Corregir una unidad y su coeficiente' })).toBeInTheDocument();
  });

  it('Residentes: emparejar por número exacto y completar datos', () => {
    render(<ResidentsTutorials businessId={7} />);
    const importar = screen.getByRole('region', { name: 'Importar residentes desde Excel' });
    expect(within(importar).getByText(/número exacto/)).toBeInTheDocument();
    expect(within(importar).getByLabelText('Video: Importar residentes desde Excel')).toHaveAttribute('src', '/tutoriales/residentes-importar.mp4');
    expect(screen.getByRole('region', { name: 'Completar los datos de los residentes' })).toBeInTheDocument();
  });
});
