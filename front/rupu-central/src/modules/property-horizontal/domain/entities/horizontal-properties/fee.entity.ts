/**
 * Entidad Fee (Expensa/Cuota)
 */

export interface Fee {
  id: string;
  unitId: string;
  amount: number;
  month: number;
  year: number;
  status: FeeStatus;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
}

export enum FeeStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export interface CreateFeeDTO {
  unitId: string;
  amount: number;
  month: number;
  year: number;
  dueDate: Date;
}

