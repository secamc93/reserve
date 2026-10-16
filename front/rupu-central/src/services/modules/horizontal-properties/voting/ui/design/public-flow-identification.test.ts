import { describe, expect, it } from 'vitest';
import { identificationError, normalizePassword, requiresDocument, requiresPassword, validateResidentFailure, validateResidentPayload } from './public-flow';

describe('requiresDocument (configuración del grupo)', () => {
  it('true si el contexto o el grupo lo exigen', () => {
    expect(requiresDocument({ require_document_validation: true })).toBe(true);
    expect(requiresDocument({ voting_group: { require_document_validation: true } })).toBe(true);
  });
  it('false si viene en false o no viene (back anterior)', () => {
    expect(requiresDocument({ require_document_validation: false })).toBe(false);
    expect(requiresDocument({ voting_group: {} })).toBe(false);
    expect(requiresDocument({})).toBe(false);
    expect(requiresDocument(null)).toBe(false);
  });
});

describe('identificationError (R1)', () => {
  it('siempre pide la unidad', () => {
    expect(identificationError({ hasUnit: false, dni: '123', requireDocument: false })).toBe('Elige tu unidad de la lista');
  });
  it('grupo sin documento: basta la unidad', () => {
    expect(identificationError({ hasUnit: true, dni: '', requireDocument: false })).toBeNull();
  });
  it('grupo con documento: el documento es obligatorio', () => {
    expect(identificationError({ hasUnit: true, dni: '  ', requireDocument: true })).toBe('Escribe tu documento de identidad');
    expect(identificationError({ hasUnit: true, dni: '900001', requireDocument: true })).toBeNull();
  });
});

describe('validateResidentPayload', () => {
  it('sin documento exigido no envía dni aunque se haya escrito', () => {
    expect(validateResidentPayload({ propertyUnitId: 5, dni: '123', requireDocument: false })).toEqual({ propertyUnitId: 5 });
  });
  it('con documento exigido lo envía sin espacios', () => {
    expect(validateResidentPayload({ propertyUnitId: 5, dni: ' 123 ', requireDocument: true })).toEqual({ propertyUnitId: 5, dni: '123' });
  });
});

describe('validateResidentFailure', () => {
  it('400 sin documento: el grupo lo exige -> mostrar el campo', () => {
    const r = validateResidentFailure(400, 'Documento requerido', false);
    expect(r.requireDocument).toBe(true);
    expect(r.message).toMatch(/exige tu documento/);
  });
  it('404 con documento: no coinciden', () => {
    const r = validateResidentFailure(404, 'Residente no encontrado', true);
    expect(r.message).toMatch(/Revisa que la unidad y el documento coincidan/);
    expect(r.requireDocument).toBe(true);
  });
  it('400 que no es por documento (unidad inactiva) no muestra el campo', () => {
    const r = validateResidentFailure(400, 'Unidad inactiva', false);
    expect(r.requireDocument).toBe(false);
    expect(r.message).toMatch(/unidad está inactiva/);
  });
  it('404 "Unidad no encontrada" (grupo sin documento)', () => {
    expect(validateResidentFailure(404, 'Unidad no encontrada', false).message).toMatch(/No encontramos esa unidad/);
  });
  it('401: el enlace venció', () => {
    expect(validateResidentFailure(401, 'Token inválido', false).message).toMatch(/Escanea el código QR/);
  });
  it('otros: usa el mensaje del back', () => {
    expect(validateResidentFailure(500, 'Falla X', true).message).toMatch(/^Falla X\./);
  });
});

describe('contraseña de la credencial impresa', () => {
  it('requiresPassword solo con require_password = true', () => {
    expect(requiresPassword({ require_password: true })).toBe(true);
    expect(requiresPassword({ require_password: false })).toBe(false);
    expect(requiresPassword({})).toBe(false);
    expect(requiresPassword(null)).toBe(false);
  });
  it('normalizePassword quita espacios y pasa a mayúsculas', () => {
    expect(normalizePassword(' k7m 2qx ')).toBe('K7M2QX');
  });
  it('identificationError exige la contraseña si el grupo la pide', () => {
    expect(identificationError({ hasUnit: true, dni: '', requireDocument: false, password: ' ', requirePassword: true })).toBe(
      'Escribe la contraseña de tu credencial',
    );
    expect(identificationError({ hasUnit: true, dni: '', requireDocument: false, password: 'K7M2QX', requirePassword: true })).toBeNull();
  });
  it('validateResidentPayload envía la contraseña solo si el grupo la exige', () => {
    expect(validateResidentPayload({ propertyUnitId: 5, dni: '', requireDocument: false, password: 'k7m2qx', requirePassword: true })).toEqual({
      propertyUnitId: 5,
      password: 'K7M2QX',
    });
    expect(validateResidentPayload({ propertyUnitId: 5, dni: '', requireDocument: false, password: 'k7m2qx', requirePassword: false })).toEqual({
      propertyUnitId: 5,
    });
  });
  it('validateResidentFailure distingue contraseña requerida e incorrecta', () => {
    expect(validateResidentFailure(400, 'Contraseña requerida', false)).toMatchObject({ requirePassword: true });
    const wrong = validateResidentFailure(403, 'Contraseña incorrecta', false);
    expect(wrong.requirePassword).toBe(true);
    expect(wrong.message).toMatch(/no coincide con la de tu unidad/);
  });
});
