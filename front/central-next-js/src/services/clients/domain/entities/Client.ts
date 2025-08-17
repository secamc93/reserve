// Domain - Client Entity
export interface Client {
  id: number;
  businessID: number;
  name: string;
  email: string;
  phone: string;
  dni?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CreateClientDTO {
  businessID: number;
  name: string;
  email: string;
  phone: string;
  dni?: string;
}

export interface UpdateClientDTO {
  businessID?: number;
  name?: string;
  email?: string;
  phone?: string;
  dni?: string;
}
