import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// next/font solo funciona compilado por Next.
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import { VotingSummaryBlock } from './voting-summary-block';
import { computeCoefficientResults } from './design/results';

describe('VotingSummaryBlock', () => {
  it('muestra por opción el % del coeficiente total y el % de lo votado', () => {
    // Votó el 60 % del coeficiente: Sí 45 (75 % de lo votado) y No 15 (25 %).
    const results = computeCoefficientResults(
      [
        { id: 1, text: 'Sí', color: '#1f8a4c' },
        { id: 2, text: 'No', color: '#c8382d' },
      ],
      [
        { hasVoted: true, coef: 45, optionId: 1 },
        { hasVoted: true, coef: 15, optionId: 2 },
        { hasVoted: false, coef: 40 },
      ],
    );
    render(<VotingSummaryBlock results={results} quorum={51} />);
    expect(screen.getByText('75,0% de lo votado')).toBeInTheDocument();
    expect(screen.getByText('25,0% de lo votado')).toBeInTheDocument();
  });
});
