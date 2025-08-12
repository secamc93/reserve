// Domain - Business Entity
export interface Business {
  id: number;
  name: string;
  code: string;
  businessTypeId: number;
  timezone: string;
  address: string;
  description: string;
  logoURL: string;
  primaryColor: string;
  secondaryColor: string;
  customDomain: string;
  isActive: boolean;
  enableDelivery: boolean;
  enablePickup: boolean;
  enableReservations: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessType {
  id: number;
  name: string;
  code: string;
  description: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessRequest {
  name: string;
  code: string;
  businessTypeId: number;
  timezone: string;
  address: string;
  description: string;
  logoURL?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
  enableDelivery?: boolean;
  enablePickup?: boolean;
  enableReservations?: boolean;
}

export interface UpdateBusinessRequest {
  name?: string;
  code?: string;
  businessTypeId?: number;
  timezone?: string;
  address?: string;
  description?: string;
  logoURL?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
  isActive?: boolean;
  enableDelivery?: boolean;
  enablePickup?: boolean;
  enableReservations?: boolean;
}

export interface CreateBusinessTypeRequest {
  name: string;
  code: string;
  description: string;
  icon: string;
}

export interface UpdateBusinessTypeRequest {
  name?: string;
  code?: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
}

// API Response types
export interface BusinessResponse {
  success: boolean;
  message: string;
  data: Business | Business[];
}

export interface BusinessTypeResponse {
  success: boolean;
  message: string;
  data: BusinessType | BusinessType[];
}

export interface BusinessListDTO {
  businesses: Business[];
  total: number;
  page: number;
  limit: number;
}
