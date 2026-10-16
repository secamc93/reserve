import { describe, expect, it } from 'vitest';
import {
  dateInputToIso,
  emptyResidentForm,
  formToCreateResidentDTO,
  formToUpdateResidentDTO,
  isoToDateInput,
  residentToForm,
  validateResidentForm,
} from './resident-form';
import type { Resident } from '../domain';

const filled = { ...emptyResidentForm(7), propertyUnitId: 3, unitLabel: 'Casa 126', name: 'Ana', email: 'ana@correo.co', dni: '123' };

describe('formulario de residente', () => {
  it('crear exige unidad, nombre, email y documento', () => {
    expect(validateResidentForm(emptyResidentForm(7), 'create')).toEqual({
      unitLabel: 'Elige una unidad de la lista',
      name: 'El nombre es obligatorio',
      email: 'El email es obligatorio',
      dni: 'El documento es obligatorio',
    });
    expect(validateResidentForm(filled, 'create')).toEqual({});
  });

  it('editar no exige email ni documento, pero valida el formato del email y las fechas', () => {
    expect(validateResidentForm({ ...filled, email: '', dni: '' }, 'edit')).toEqual({});
    expect(validateResidentForm({ ...filled, email: 'sin-arroba' }, 'edit')).toEqual({ email: 'Email no válido' });
    expect(validateResidentForm({ ...filled, leaseStartDate: '2025-02-01', leaseEndDate: '2025-01-01' }, 'edit')).toEqual({
      leaseEndDate: 'El fin debe ser posterior al inicio',
    });
  });

  it('fechas: input date <-> RFC 3339', () => {
    expect(dateInputToIso('2024-01-15')).toBe('2024-01-15T00:00:00Z');
    expect(dateInputToIso('')).toBeUndefined();
    expect(isoToDateInput('2024-01-15T05:00:00Z')).toBe('2024-01-15');
    expect(isoToDateInput('0001-01-01T00:00:00Z')).toBe('');
  });

  it('crear: DTO con fechas y canon', () => {
    const dto = formToCreateResidentDTO({ ...filled, moveInDate: '2024-02-01', monthlyRent: '1.500.000' });
    expect(dto).toMatchObject({ propertyUnitId: 3, residentTypeId: 7, name: 'Ana', dni: '123', moveInDate: '2024-02-01T00:00:00Z', monthlyRent: 1500000 });
    expect(dto.phone).toBeUndefined();
  });

  it('editar: carga el detalle y envía el estado activo', () => {
    const r: Resident = {
      id: 1, businessId: 1, propertyUnitId: 3, propertyUnitNumber: '126', residentTypeId: 8, residentTypeName: 'Arrendatario',
      residentTypeCode: 'tenant', name: 'Ana', email: 'a@b.co', dni: '1', isMainResident: true, isActive: true,
      moveInDate: '2024-02-01T00:00:00Z', createdAt: '', updatedAt: '',
    };
    const values = residentToForm(r, 'Casa 126');
    expect(values).toMatchObject({ unitLabel: 'Casa 126', residentTypeId: 8, moveInDate: '2024-02-01' });
    expect(formToUpdateResidentDTO({ ...values, isActive: false })).toMatchObject({ isActive: false, propertyUnitId: 3, moveInDate: '2024-02-01T00:00:00Z' });
  });
});
