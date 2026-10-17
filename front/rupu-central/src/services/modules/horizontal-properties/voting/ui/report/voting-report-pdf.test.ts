import { describe, expect, it, vi } from 'vitest';

// next/font solo funciona compilado por Next.
vi.mock('next/font/google', () => ({
  Public_Sans: () => ({ variable: 'font-a', className: 'font-a' }),
  JetBrains_Mono: () => ({ variable: 'font-b', className: 'font-b' }),
}));

import {
  attendanceSummary,
  buildVotingReportPdf,
  formatVoteTime,
  pdfText,
  toReportVoting,
  votingStateLabel,
  type ReportUnitDetail,
} from './voting-report-pdf';
import type { Voting, VotingOption } from '../../domain/entities';

const voting = (id: number, overrides: Partial<Voting> = {}): Voting => ({
  id,
  votingGroupId: 2,
  title: `Punto ${id}. Aprobacion de prueba`,
  description: '',
  votingType: 'simple',
  isSecret: false,
  allowAbstention: true,
  isActive: false,
  displayOrder: id,
  requiredPercentage: 51,
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

const options: VotingOption[] = [
  { id: 2, votingId: 1, optionText: 'No', optionCode: 'no', displayOrder: 2, isActive: true },
  { id: 1, votingId: 1, optionText: 'Sí', optionCode: 'si', displayOrder: 1, isActive: true },
];

const unit = (n: string, coef: number, vote: string | null, attended = true): ReportUnitDetail => ({
  property_unit_number: n,
  participation_coefficient: coef,
  resident_name: `Residente ${n}`,
  has_voted: vote !== null,
  has_attendance: attended,
  option_text: vote,
  voted_at: vote ? '2026-10-17T19:15:00Z' : null,
});

// Votó el 70 %: Sí 35 (50 % de lo votado), No 35; 30 % sin votar.
const units = [unit('101', 35, 'Sí'), unit('102', 35, 'No'), unit('103', 20, null, false), unit('104', 10, null)];

describe('informe PDF de votaciones', () => {
  it('toReportVoting ordena las opciones y calcula % del total y % de lo votado', () => {
    const r = toReportVoting(voting(1), options, units);
    expect(r.results.segments.map((s) => s.label)).toEqual(['Sí', 'No']);
    expect(r.results.segments[0].pct).toBeCloseTo(35);
    expect(r.results.segments[0].pctOfVoted).toBeCloseTo(50);
    expect(r.results.participation).toBeCloseTo(70);
    expect(r.quorum).toBe(51);
  });

  it('la asistencia cuenta unidades marcadas y su % del coeficiente', () => {
    expect(attendanceSummary(units)).toEqual({ present: 3, total: 4, pct: 80 });
  });

  it('estado: abierta, cerrada con votos o sin votos', () => {
    expect(votingStateLabel(toReportVoting(voting(1, { isActive: true }), options, units))).toBe('Abierta');
    expect(votingStateLabel(toReportVoting(voting(1), options, units))).toBe('Cerrada');
    expect(votingStateLabel(toReportVoting(voting(1), options, [unit('101', 50, null)]))).toBe('Sin votos');
  });

  it('la hora del voto sale en hora de Colombia', () => {
    expect(formatVoteTime('2026-10-17T19:15:00Z')).toBe('14:15');
    expect(formatVoteTime(null)).toBe('');
  });

  it('pdfText quita lo que las fuentes estándar no pintan y conserva tildes y ñ', () => {
    expect(pdfText('Año — “acta” ✓ ñandú')).toBe('Año - "acta"  ñandú');
  });

  it('arma una portada y una página por votación, con títulos y votos por unidad', async () => {
    const doc = await buildVotingReportPdf({
      groupName: 'Asamblea 2026',
      propertyName: 'Conjunto Prueba',
      generatedAt: new Date('2026-10-17T20:00:00Z'),
      votings: [toReportVoting(voting(1), options, units), toReportVoting(voting(2, { isSecret: true }), options, units)],
    });
    expect(doc.getNumberOfPages()).toBe(3);
    const raw = doc.output();
    expect(raw).toContain('Punto 1. Aprobacion de prueba');
    expect(raw).toContain('Punto 2. Aprobacion de prueba');
    expect(raw).toContain('Residente 101');
    expect(raw).toContain('Voto secreto');
    expect(raw).toContain(' 3 de 3');
  });
});
