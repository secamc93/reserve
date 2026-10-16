import { describe, expect, it } from 'vitest';
import { emptyUnitForm, formToCreateDTO, formToUpdateDTO, parseOptionalNumber, unitToForm, validateUnitForm } from './unit-form';
import type { PropertyUnit } from '../domain';

const unit: PropertyUnit = {
  id: 9,
  businessId: 1,
  number: '126',
  block: 'Casa',
  unitType: 'house',
  coefficient: 0.503,
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

describe('formulario de unidad', () => {
  it('acepta coma decimal en los números', () => {
    expect(parseOptionalNumber('0,503')).toBe(0.503);
    expect(parseOptionalNumber('')).toBeUndefined();
    expect(parseOptionalNumber('abc')).toBeUndefined();
  });

  it('exige el número y valida los campos numéricos', () => {
    expect(validateUnitForm(emptyUnitForm)).toEqual({ number: 'El número es obligatorio' });
    const errors = validateUnitForm({ ...emptyUnitForm, number: '1', coefficient: 'x', area: '-3', floor: '-1', block: 'Bloque largo de más de diez' });
    expect(errors).toEqual({ coefficient: 'Debe ser un número', area: 'No puede ser negativo', block: 'Máximo 10 caracteres' });
  });

  it('crear: envía el coeficiente y omite lo vacío', () => {
    const dto = formToCreateDTO({ ...emptyUnitForm, number: ' 126 ', block: 'Casa', unitType: 'house', coefficient: '0,503' });
    expect(dto).toEqual({
      number: '126',
      block: 'Casa',
      unitType: 'house',
      floor: undefined,
      area: undefined,
      bedrooms: undefined,
      bathrooms: undefined,
      coefficient: 0.503,
      description: undefined,
    });
  });

  it('editar: conserva los valores, permite vaciar el bloque y envía el estado', () => {
    const values = unitToForm(unit);
    expect(values.coefficient).toBe('0,503');
    const dto = formToUpdateDTO({ ...values, block: '', isActive: false });
    expect(dto).toMatchObject({ number: '126', block: '', coefficient: 0.503, isActive: false });
  });
});
