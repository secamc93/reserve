/**
 * Interfaces para la respuesta del backend - Resources
 */

export interface BackendResource {
  id: number;
  name: string;
  description: string;
  business_type_id?: number;
  business_type_name?: string;
  created_at: string;
  updated_at: string;
}

export interface BackendResourcesResponse {
  success: boolean;
  message: string;
  data: {
    resources: BackendResource[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface BackendCreateResourceResponse {
  success: boolean;
  message: string;
  data?: BackendResource;
  error?: string;
}

export interface BackendUpdateResourceResponse {
  success: boolean;
  message: string;
  data?: BackendResource;
  error?: string;
}

export interface BackendDeleteResourceResponse {
  success: boolean;
  message: string;
}

