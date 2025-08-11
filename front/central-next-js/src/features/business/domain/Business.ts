// Domain - Business Entity
export interface BusinessType {
  id: number;
  name: string;
  code: string;
}

export interface Business {
  id: number;
  name: string;
  code: string;
  businessType: BusinessType;
  timezone?: string;
  address?: string;
  description?: string;
  logoURL?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customDomain?: string;
  isActive: boolean;
  enableDelivery?: boolean;
  enablePickup?: boolean;
  enableReservations?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessListDTO {
  businesses: Business[];
  total: number;
  page: number;
  limit: number;
}
