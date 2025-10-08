/**
 * Entidad Unit (Unidad/Departamento)
 */

export interface Unit {
  id: string;
  number: string;
  floor: number;
  area: number; // m²
  ownerId: string;
  status: UnitStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum UnitStatus {
  OCCUPIED = 'OCCUPIED',
  VACANT = 'VACANT',
  MAINTENANCE = 'MAINTENANCE',
}

export interface CreateUnitDTO {
  number: string;
  floor: number;
  area: number;
  ownerId: string;
}

