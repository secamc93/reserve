// Domain - Room Entity
export interface Room {
  id: number;
  businessId: number;
  name: string;
  code: string;
  description?: string;
  capacity: number;
  minCapacity?: number;
  maxCapacity?: number;
  isActive: boolean;
}
