// Domain - Business Entity
export interface Business {
  id: number;
  name: string;
  code: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo_url: string;
  timezone: string;
  primary_color: string;
  secondary_color: string;
  custom_domain: string;
  is_active: boolean;
  business_type_id: number;
  business_type: string;
  enable_delivery: boolean;
  enable_pickup: boolean;
  enable_reservations: boolean;
  created_at: string;
  updated_at: string;
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
  description: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  logo_file?: File;
  timezone?: string;
  primary_color?: string;
  secondary_color?: string;
  custom_domain?: string;
  business_type_id: number;
  enable_delivery?: boolean;
  enable_pickup?: boolean;
  enable_reservations?: boolean;
}

export interface UpdateBusinessRequest {
  name?: string;
  code?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  logo_file?: File;
  timezone?: string;
  primary_color?: string;
  secondary_color?: string;
  custom_domain?: string;
  business_type_id?: number;
  is_active?: boolean;
  enable_delivery?: boolean;
  enable_pickup?: boolean;
  enable_reservations?: boolean;
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
