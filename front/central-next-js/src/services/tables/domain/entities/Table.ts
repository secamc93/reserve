// Domain - Table Entity
export interface Table {
  id: number;
  businessId: number;
  number: number;
  capacity: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// DTOs para operaciones CRUD
export interface CreateTableRequest {
  businessId: number;
  number: number;
  capacity: number;
}

export interface UpdateTableRequest {
  businessId?: number;
  number?: number;
  capacity?: number;
  isActive?: boolean;
}

export interface TableResponse {
  success: boolean;
  message: string;
  data: Table | Table[];
}
