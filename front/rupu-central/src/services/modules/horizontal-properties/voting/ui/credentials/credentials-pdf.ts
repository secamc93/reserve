/**
 * PDF de credenciales de votación: una tarjeta por unidad con el QR del grupo, la unidad
 * ("Casa 126"), el propietario y la contraseña. 8 tarjetas por hoja A4 con líneas de corte,
 * para entregarlas en la mesa de asistencia.
 */

import type { jsPDF as JsPDF } from 'jspdf';

export interface CredentialCard {
  unitNumber: string;
  unitBlock: string;
  ownerName: string;
  password: string;
}

export interface CredentialsPdfInput {
  groupName: string;
  propertyName?: string;
  /** URL pública del grupo (la que abre el QR). */
  publicUrl: string;
  /** QR de publicUrl como data URL PNG. */
  qrDataUrl: string;
  cards: CredentialCard[];
}

/** "Casa 126", "Local 1001"; sin tipo/bloque, "Unidad 7". */
export function unitLabel(card: Pick<CredentialCard, 'unitBlock' | 'unitNumber'>): string {
  const block = card.unitBlock.trim();
  return block ? `${block} ${card.unitNumber}` : `Unidad ${card.unitNumber}`;
}

/** Contraseña con un espacio en la mitad para leerla mejor impresa ("K7M 2QX"). */
export function displayPassword(password: string): string {
  if (password.length < 6) return password;
  const half = Math.ceil(password.length / 2);
  return `${password.slice(0, half)} ${password.slice(half)}`;
}

export const CARDS_PER_PAGE = 8;
const COLS = 2;
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 8;
const CARD_W = (PAGE_W - MARGIN * 2) / COLS; // 97 mm
const CARD_H = (PAGE_H - MARGIN * 2) / (CARDS_PER_PAGE / COLS); // 70.25 mm

/** Posición (mm) de la tarjeta i dentro de su hoja. */
export function cardPosition(i: number): { page: number; x: number; y: number } {
  const page = Math.floor(i / CARDS_PER_PAGE);
  const slot = i % CARDS_PER_PAGE;
  return {
    page,
    x: MARGIN + (slot % COLS) * CARD_W,
    y: MARGIN + Math.floor(slot / COLS) * CARD_H,
  };
}

function drawCutLines(doc: JsPDF) {
  doc.setDrawColor(170);
  doc.setLineWidth(0.2);
  doc.setLineDashPattern([1.5, 1.5], 0);
  for (let c = 0; c <= COLS; c++) {
    const x = MARGIN + c * CARD_W;
    doc.line(x, MARGIN, x, PAGE_H - MARGIN);
  }
  for (let r = 0; r <= CARDS_PER_PAGE / COLS; r++) {
    const y = MARGIN + r * CARD_H;
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  }
  doc.setLineDashPattern([], 0);
}

function drawCard(doc: JsPDF, input: CredentialsPdfInput, card: CredentialCard, x: number, y: number) {
  const pad = 5;
  const qr = 36;
  const textX = x + pad + qr + 5;
  const textW = CARD_W - (textX - x) - pad;

  // Encabezado: propiedad y asamblea
  doc.setTextColor(110);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  const header = [input.propertyName, input.groupName].filter(Boolean).join(' · ');
  doc.text(doc.splitTextToSize(header.toUpperCase(), CARD_W - pad * 2)[0] ?? '', x + pad, y + pad + 2);

  doc.addImage(input.qrDataUrl, 'PNG', x + pad, y + pad + 5, qr, qr);

  // Unidad
  doc.setTextColor(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(unitLabel(card), textX, y + pad + 13);

  // Propietario
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(110);
  doc.text('PROPIETARIO', textX, y + pad + 19);
  doc.setFontSize(9);
  doc.setTextColor(20);
  const owner = doc.splitTextToSize(card.ownerName || 'Sin propietario registrado', textW).slice(0, 2);
  doc.text(owner, textX, y + pad + 23);

  // Contraseña
  doc.setFontSize(7);
  doc.setTextColor(110);
  doc.text('CONTRASEÑA DE VOTACIÓN', textX, y + pad + 33);
  doc.setFont('courier', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(20);
  doc.text(displayPassword(card.password), textX, y + pad + 40);

  // Instrucciones
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(60);
  const steps = doc.splitTextToSize(
    `1. Escanee el código QR con su celular.  2. Elija su unidad: ${card.unitNumber}.  3. Escriba la contraseña.  Es personal: no la comparta.`,
    CARD_W - pad * 2,
  );
  doc.text(steps.slice(0, 3), x + pad, y + pad + qr + 11);
}

/** Arma el PDF (jspdf se carga solo en el navegador). */
export async function buildCredentialsPdf(input: CredentialsPdfInput): Promise<JsPDF> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  doc.setProperties({ title: `Credenciales de votación - ${input.groupName}` });
  input.cards.forEach((card, i) => {
    const pos = cardPosition(i);
    if (i > 0 && i % CARDS_PER_PAGE === 0) doc.addPage();
    if (i % CARDS_PER_PAGE === 0) drawCutLines(doc);
    drawCard(doc, input, card, pos.x, pos.y);
  });
  return doc;
}
