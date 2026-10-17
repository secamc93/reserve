/**
 * Informe PDF de un grupo de votación (A4 vertical), para el acta de la asamblea:
 *  - portada con la asistencia y un cuadro resumen de todas las votaciones;
 *  - una sección por votación: veredicto, participación, barra por coeficiente con el quórum,
 *    gráfica de barras por opción (% del total y % de lo votado) y el detalle de votos por unidad.
 * Solo dibuja datos que ya calculó la UI (computeCoefficientResults); no hace peticiones.
 */

import type { jsPDF as JsPDF } from 'jspdf';
import {
  computeCoefficientResults,
  formatCoef,
  formatOrder,
  formatPct,
  getVerdict,
  getWinner,
  resolveQuorum,
  votingTypeLabel,
  type CoefficientResults,
} from '../design';
import type { Voting, VotingOption } from '../../domain/entities';

/** Unidad tal como la entrega voting-details. */
export interface ReportUnitDetail {
  property_unit_number: string;
  participation_coefficient: number;
  resident_name: string | null;
  has_voted: boolean;
  has_attendance: boolean;
  option_text: string | null;
  voted_at: string | null;
}

export interface ReportVoting {
  order: number;
  title: string;
  description: string;
  typeLabel: string;
  quorum: number;
  allowAbstention: boolean;
  isSecret: boolean;
  isActive: boolean;
  results: CoefficientResults;
  units: ReportUnitDetail[];
}

export interface VotingReportInput {
  groupName: string;
  propertyName?: string;
  generatedAt: Date;
  votings: ReportVoting[];
}

/** Arma los datos de una votación para el informe (mismo cálculo que el panel en vivo). */
export function toReportVoting(voting: Voting, options: VotingOption[], units: ReportUnitDetail[]): ReportVoting {
  const sorted = [...options].sort((a, b) => a.displayOrder - b.displayOrder);
  const results = computeCoefficientResults(
    sorted.map((o) => ({ id: o.id, text: o.optionText, code: o.optionCode, color: o.color })),
    units.map((u) => ({ hasVoted: u.has_voted, coef: u.participation_coefficient || 0, optionText: u.option_text })),
  );
  return {
    order: voting.displayOrder,
    title: voting.title,
    description: voting.description,
    typeLabel: votingTypeLabel(voting.votingType),
    quorum: resolveQuorum(voting.requiredPercentage),
    allowAbstention: voting.allowAbstention,
    isSecret: voting.isSecret,
    isActive: voting.isActive,
    results,
    units,
  };
}

/** Asistencia del grupo: unidades marcadas y su % del coeficiente total. */
export function attendanceSummary(units: ReportUnitDetail[]): { present: number; total: number; pct: number } {
  const totalCoef = units.reduce((s, u) => s + (u.participation_coefficient || 0), 0);
  const present = units.filter((u) => u.has_attendance);
  const presentCoef = present.reduce((s, u) => s + (u.participation_coefficient || 0), 0);
  return { present: present.length, total: units.length, pct: totalCoef > 0 ? (presentCoef / totalCoef) * 100 : 0 };
}

export function votingStateLabel(v: Pick<ReportVoting, 'isActive' | 'results'>): string {
  if (v.isActive) return 'Abierta';
  return v.results.votedUnits > 0 ? 'Cerrada' : 'Sin votos';
}

/** Orden natural de unidades: "2" antes de "10". */
const byUnit = (a: ReportUnitDetail, b: ReportUnitDetail) =>
  a.property_unit_number.localeCompare(b.property_unit_number, 'es', { numeric: true });

const timeFormatter = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', hour12: false });
const dateTimeFormatter = new Intl.DateTimeFormat('es-CO', {
  timeZone: 'America/Bogota',
  dateStyle: 'long',
  timeStyle: 'short',
});

export function formatVoteTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : timeFormatter.format(d);
}

// ===================== Dibujo =====================

const PAGE_W = 210;
const PAGE_H = 297;
const M = 16; // margen
const CONTENT_W = PAGE_W - M * 2;
const BOTTOM = PAGE_H - 18;

const INK = '#1a1a1a';
const SOFT = '#4b4a46';
const MUTED = '#8a8580';
const BORDER = '#e4e2dd';
const PENDING = '#c9c6c0';
const ACCENT = '#c8603f';
const PAPER = '#f5f5f4';

/** jsPDF con las fuentes estándar solo pinta WinAnsi: se reemplazan los caracteres que no tiene. */
export function pdfText(value: string): string {
  return value
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7E -ÿ\n]/g, '');
}

class Writer {
  y = M;
  constructor(readonly doc: JsPDF) {}

  ensure(height: number) {
    if (this.y + height > BOTTOM) {
      this.doc.addPage();
      this.y = M;
    }
  }

  text(value: string, opts: { size: number; bold?: boolean; color?: string; x?: number; width?: number; lineGap?: number; mono?: boolean }) {
    const { doc } = this;
    doc.setFont(opts.mono ? 'courier' : 'helvetica', opts.bold ? 'bold' : 'normal');
    doc.setFontSize(opts.size);
    doc.setTextColor(opts.color ?? INK);
    const lines: string[] = doc.splitTextToSize(pdfText(value), opts.width ?? CONTENT_W);
    const lineH = opts.size * 0.3528 * 1.25 + (opts.lineGap ?? 0);
    lines.forEach((line) => {
      this.ensure(lineH);
      doc.text(line, opts.x ?? M, this.y + opts.size * 0.3528);
      this.y += lineH;
    });
  }

  rule(color = BORDER) {
    this.doc.setDrawColor(color);
    this.doc.setLineWidth(0.2);
    this.doc.line(M, this.y, PAGE_W - M, this.y);
  }
}

function drawStackedBar(w: Writer, v: ReportVoting) {
  const { doc } = w;
  const h = 7;
  w.ensure(h + 14);
  const top = w.y + 5;
  // etiqueta del quórum
  const qx = M + (CONTENT_W * v.quorum) / 100;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(ACCENT);
  doc.text(`QUÓRUM ${v.quorum}%`, Math.min(qx + 1.2, PAGE_W - M - 18), top - 1.2);
  // fondo (pendiente)
  doc.setDrawColor(PENDING);
  doc.setLineWidth(0.2);
  doc.setFillColor('#ffffff');
  doc.rect(M, top, CONTENT_W, h, 'FD');
  let x = M;
  v.results.segments.forEach((s) => {
    const sw = (CONTENT_W * s.pct) / 100;
    if (sw <= 0) return;
    doc.setFillColor(s.color);
    doc.rect(x, top, sw, h, 'F');
    x += sw;
  });
  doc.setDrawColor(ACCENT);
  doc.setLineWidth(0.6);
  doc.line(qx, top - 1, qx, top + h + 1);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(MUTED);
  doc.text('0', M, top + h + 3.5);
  doc.text('% por coeficiente del conjunto', M + CONTENT_W / 2, top + h + 3.5, { align: 'center' });
  doc.text('100', PAGE_W - M, top + h + 3.5, { align: 'right' });
  w.y = top + h + 7;
}

function drawOptionBars(w: Writer, v: ReportVoting) {
  const { doc } = w;
  const labelW = 52;
  const barX = M + labelW;
  const barW = CONTENT_W - labelW - 58;
  const rowH = 9;
  const max = Math.max(1, ...v.results.segments.map((s) => s.pctOfVoted ?? 0));

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(MUTED);
  w.ensure(6);
  doc.text('OPCIÓN', M, w.y + 2.5);
  doc.text('% DE LO VOTADO', barX, w.y + 2.5);
  doc.text('UNID.', PAGE_W - M - 40, w.y + 2.5, { align: 'right' });
  doc.text('% TOTAL', PAGE_W - M - 20, w.y + 2.5, { align: 'right' });
  doc.text('% VOTADO', PAGE_W - M, w.y + 2.5, { align: 'right' });
  w.y += 4.5;

  v.results.segments.forEach((s) => {
    w.ensure(rowH);
    const cy = w.y + rowH / 2;
    doc.setFillColor(s.color);
    doc.rect(M, cy - 1.6, 3.2, 3.2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(INK);
    doc.text(doc.splitTextToSize(pdfText(s.label), labelW - 7)[0] ?? '', M + 5.5, cy + 1.2);
    // pista y barra (escala: la opción con más % de lo votado ocupa toda la pista)
    doc.setFillColor(PAPER);
    doc.rect(barX, cy - 2.5, barW, 5, 'F');
    const len = (barW * (s.pctOfVoted ?? 0)) / max;
    if (len > 0) {
      doc.setFillColor(s.color);
      doc.rect(barX, cy - 2.5, len, 5, 'F');
    }
    doc.setFont('courier', 'bold');
    doc.setFontSize(9);
    doc.text(String(s.votes), PAGE_W - M - 40, cy + 1.2, { align: 'right' });
    doc.text(`${formatPct(s.pct)}%`, PAGE_W - M - 20, cy + 1.2, { align: 'right' });
    doc.text(`${formatPct(s.pctOfVoted ?? 0)}%`, PAGE_W - M, cy + 1.2, { align: 'right' });
    w.y += rowH;
  });
  // fila de pendientes
  w.ensure(rowH);
  const cy = w.y + rowH / 2;
  doc.setDrawColor(PENDING);
  doc.setLineWidth(0.2);
  doc.rect(M, cy - 1.6, 3.2, 3.2, 'S');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  doc.text('Sin votar', M + 5.5, cy + 1.2);
  doc.setFont('courier', 'bold');
  doc.text(String(v.results.pending.votes), PAGE_W - M - 40, cy + 1.2, { align: 'right' });
  doc.text(`${formatPct(v.results.pending.pct)}%`, PAGE_W - M - 20, cy + 1.2, { align: 'right' });
  w.y += rowH + 1;
}

function drawUnitsTable(w: Writer, v: ReportVoting) {
  const { doc } = w;
  const voted = v.units.filter((u) => u.has_voted).sort(byUnit);
  const cols = [
    { label: 'UNIDAD', x: M, w: 22 },
    { label: 'RESIDENTE', x: M + 22, w: 70 },
    { label: 'VOTO', x: M + 92, w: 50 },
    { label: 'COEF.', x: M + 142, w: 18, right: true },
    { label: 'HORA', x: M + 160, w: 18, right: true },
  ];
  const rowH = 5.2;
  const header = () => {
    doc.setFillColor(PAPER);
    doc.rect(M, w.y, CONTENT_W, rowH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(MUTED);
    cols.forEach((c) => doc.text(c.label, c.right ? c.x + c.w : c.x + 1, w.y + 3.6, c.right ? { align: 'right' } : undefined));
    w.y += rowH;
  };

  w.ensure(14);
  w.text(`Votos por unidad (${voted.length})`, { size: 10, bold: true });
  w.y += 1;
  if (voted.length === 0) {
    w.text('Ninguna unidad votó.', { size: 8.5, color: MUTED });
    return;
  }
  header();
  voted.forEach((u, i) => {
    if (w.y + rowH > BOTTOM) {
      doc.addPage();
      w.y = M;
      header();
    }
    if (i % 2 === 1) {
      doc.setFillColor('#fafaf9');
      doc.rect(M, w.y, CONTENT_W, rowH, 'F');
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(INK);
    const cells = [
      u.property_unit_number,
      u.resident_name || '',
      v.isSecret ? 'Voto secreto' : u.option_text || '',
      formatCoef(u.participation_coefficient || 0),
      formatVoteTime(u.voted_at),
    ];
    cols.forEach((c, ci) => {
      const t = doc.splitTextToSize(pdfText(cells[ci]), c.w - 2)[0] ?? '';
      doc.text(t, c.right ? c.x + c.w : c.x + 1, w.y + 3.6, c.right ? { align: 'right' } : undefined);
    });
    w.y += rowH;
  });

  const pending = v.units.filter((u) => !u.has_voted).sort(byUnit);
  w.y += 3;
  w.text(`Sin votar (${pending.length})`, { size: 9, bold: true, color: SOFT });
  if (pending.length > 0) {
    w.text(pending.map((u) => u.property_unit_number).join(', '), { size: 7.5, color: SOFT });
  }
}

function drawVoting(w: Writer, v: ReportVoting) {
  const { doc } = w;
  doc.addPage();
  w.y = M;
  const verdict = getVerdict(v.results.segments, v.results.participation, v.quorum);

  w.text(`VOTACIÓN ${formatOrder(v.order)} · ${votingStateLabel(v).toUpperCase()}`, { size: 7.5, bold: true, color: MUTED });
  w.y += 1;
  w.text(v.title, { size: 16, bold: true });
  if (v.description.trim()) {
    w.y += 1;
    w.text(v.description, { size: 9, color: SOFT });
  }
  w.y += 1;
  const meta = [
    `Tipo: ${v.typeLabel}`,
    `Quórum requerido: ${v.quorum}%`,
    v.allowAbstention ? 'Abstención permitida' : 'Sin abstención',
    v.isSecret ? 'Secreta' : 'Pública',
  ].join('  ·  ');
  w.text(meta, { size: 8, color: MUTED });
  w.y += 4;

  // Cifras clave
  w.ensure(22);
  const boxes = [
    { label: 'RESULTADO', value: verdict.label, color: verdict.color },
    { label: 'PARTICIPACIÓN', value: `${formatPct(v.results.participation)}%`, color: INK },
    { label: 'UNIDADES QUE VOTARON', value: `${v.results.votedUnits} / ${v.results.totalUnits}`, color: INK },
  ];
  const bw = (CONTENT_W - 8) / 3;
  boxes.forEach((b, i) => {
    const x = M + i * (bw + 4);
    doc.setDrawColor(BORDER);
    doc.setLineWidth(0.25);
    doc.roundedRect(x, w.y, bw, 18, 1.5, 1.5, 'S');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(MUTED);
    doc.text(b.label, x + 3.5, w.y + 5);
    doc.setFontSize(b.value.length > 14 ? 10 : 14);
    doc.setTextColor(b.color);
    doc.text(doc.splitTextToSize(pdfText(b.value), bw - 7)[0] ?? '', x + 3.5, w.y + 13);
  });
  w.y += 24;

  drawStackedBar(w, v);
  w.y += 2;
  drawOptionBars(w, v);
  w.text(
    '% total: coeficiente de la opción sobre el 100% del conjunto.  % votado: sobre el coeficiente de las unidades que votaron.',
    { size: 7, color: MUTED },
  );
  w.y += 5;
  drawUnitsTable(w, v);
}

function drawCover(w: Writer, input: VotingReportInput) {
  const { doc } = w;
  w.text('INFORME DE VOTACIONES', { size: 8, bold: true, color: ACCENT });
  w.y += 1;
  w.text(input.groupName, { size: 20, bold: true });
  if (input.propertyName) w.text(input.propertyName, { size: 11, color: SOFT });
  w.y += 1;
  w.text(`Generado el ${dateTimeFormatter.format(input.generatedAt)} (hora de Colombia)`, { size: 8.5, color: MUTED });
  w.y += 5;

  const first = input.votings.find((v) => v.units.length > 0);
  if (first) {
    const a = attendanceSummary(first.units);
    w.text(
      `Asistencia registrada: ${a.present} de ${a.total} unidades · ${formatPct(a.pct)}% del coeficiente`,
      { size: 10, bold: true, color: SOFT },
    );
    w.y += 4;
  }

  w.rule();
  w.y += 4;
  w.text(`Resumen (${input.votings.length} votaciones)`, { size: 11, bold: true });
  w.y += 2;

  const cols = [
    { label: 'N.º', x: M, w: 10 },
    { label: 'VOTACIÓN', x: M + 10, w: 72 },
    { label: 'ESTADO', x: M + 82, w: 18 },
    { label: 'PARTIC.', x: M + 100, w: 17, right: true },
    { label: 'OPCIÓN CON MÁS COEF.', x: M + 120, w: 34 },
    { label: 'RESULTADO', x: M + 154, w: 24 },
  ];
  doc.setFillColor(PAPER);
  doc.rect(M, w.y, CONTENT_W, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(MUTED);
  cols.forEach((c) => doc.text(c.label, c.right ? c.x + c.w : c.x + 1, w.y + 4, c.right ? { align: 'right' } : undefined));
  w.y += 6;

  input.votings.forEach((v) => {
    const winner = getWinner(v.results.segments);
    const verdict = getVerdict(v.results.segments, v.results.participation, v.quorum);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const titleLines: string[] = doc.splitTextToSize(pdfText(v.title), cols[1].w - 2).slice(0, 3);
    const rowH = Math.max(7, titleLines.length * 3.6 + 3);
    w.ensure(rowH);
    const ty = w.y + 4.4;
    doc.setTextColor(INK);
    doc.text(formatOrder(v.order), M + 1, ty);
    doc.text(titleLines, M + 11, ty);
    doc.setTextColor(SOFT);
    doc.text(votingStateLabel(v), cols[2].x + 1, ty);
    doc.setFont('courier', 'bold');
    doc.setTextColor(INK);
    doc.text(`${formatPct(v.results.participation)}%`, cols[3].x + cols[3].w, ty, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    const win = winner ? `${winner.label} ${formatPct(winner.pct)}% (${formatPct(winner.pctOfVoted ?? 0)}% vot.)` : '-';
    doc.text(doc.splitTextToSize(pdfText(win), cols[4].w - 2).slice(0, 2), cols[4].x + 1, ty);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(verdict.color);
    doc.text(doc.splitTextToSize(pdfText(verdict.label), cols[5].w - 1).slice(0, 2), cols[5].x + 1, ty);
    w.y += rowH;
    w.rule();
  });

  w.y += 6;
  w.text(
    'Los porcentajes se calculan por coeficiente de participación. "% vot." es el porcentaje sobre el coeficiente de las unidades que votaron. El resultado compara la participación con el quórum requerido de cada votación.',
    { size: 7.5, color: MUTED },
  );
}

function drawFooters(doc: JsPDF, input: VotingReportInput) {
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(MUTED);
    doc.text(pdfText(`${input.propertyName ? `${input.propertyName} · ` : ''}${input.groupName}`), M, PAGE_H - 9);
    doc.text(`Página ${p} de ${total}`, PAGE_W - M, PAGE_H - 9, { align: 'right' });
  }
}

/** Arma el PDF (jspdf se carga solo en el navegador). */
export async function buildVotingReportPdf(input: VotingReportInput): Promise<JsPDF> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  doc.setProperties({ title: pdfText(`Informe de votaciones - ${input.groupName}`) });
  const w = new Writer(doc);
  drawCover(w, input);
  input.votings.forEach((v) => drawVoting(w, v));
  drawFooters(doc, input);
  return doc;
}
