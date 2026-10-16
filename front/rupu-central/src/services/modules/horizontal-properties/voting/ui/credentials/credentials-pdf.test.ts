import { describe, expect, it } from 'vitest';
import { buildCredentialsPdf, cardPosition, CARDS_PER_PAGE, displayPassword, unitLabel } from './credentials-pdf';

// PNG 1x1 transparente
const QR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

describe('credenciales de votación (PDF)', () => {
  it('etiqueta la unidad con su tipo y número, nunca con el id de base de datos', () => {
    expect(unitLabel({ unitBlock: 'Casa', unitNumber: '126' })).toBe('Casa 126');
    expect(unitLabel({ unitBlock: '', unitNumber: '7' })).toBe('Unidad 7');
  });

  it('parte la contraseña en dos para leerla impresa', () => {
    expect(displayPassword('K7M2QX')).toBe('K7M 2QX');
  });

  it('8 tarjetas por hoja, en 2 columnas', () => {
    expect(CARDS_PER_PAGE).toBe(8);
    expect(cardPosition(0)).toMatchObject({ page: 0 });
    expect(cardPosition(1).x).toBeGreaterThan(cardPosition(0).x);
    expect(cardPosition(2).y).toBeGreaterThan(cardPosition(0).y);
    expect(cardPosition(8)).toEqual({ ...cardPosition(0), page: 1 });
  });

  it('una hoja por cada 8 unidades, con unidad, propietario y contraseña', async () => {
    const cards = Array.from({ length: 17 }, (_, i) => ({
      unitNumber: String(i + 1),
      unitBlock: 'Casa',
      ownerName: `PROPIETARIO ${i + 1}`,
      password: 'K7M2QX',
    }));
    const doc = await buildCredentialsPdf({ groupName: 'Asamblea 2026', publicUrl: 'https://x', qrDataUrl: QR, cards });
    expect(doc.getNumberOfPages()).toBe(3);
    const raw = doc.output();
    expect(raw).toContain('Casa 17');
    expect(raw).toContain('PROPIETARIO 17');
    expect(raw).toContain('K7M 2QX');
  });
});
