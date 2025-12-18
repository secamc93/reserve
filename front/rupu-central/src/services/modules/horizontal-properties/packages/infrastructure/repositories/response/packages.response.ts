/**
 * Interfaces de respuesta del backend para Paquetes
 */

export interface BackendPackage {
  id: number;
  business_id: number;
  property_unit_id: number;
  resident_id?: number;
  package_status_id: number;
  carrier: string;
  tracking_number: string;
  qr_code: string;
  received_by_user_id?: number;
  received_at?: string;
  delivered_by_user_id?: number;
  delivered_at?: string;
  description?: string;
  notes?: string;
  notify_resident: boolean;
  notification_sent_at?: string;
  created_at: string;
  updated_at: string;
  property_unit_number?: string;
  resident_name?: string;
  status_name?: string;
  status_code?: string;
}

export interface BackendPackageList {
  id: number;
  tracking_number: string;
  carrier: string;
  property_unit_number: string;
  resident_name: string;
  status_name: string;
  status_code: string;
  received_at?: string;
  delivered_at?: string;
  created_at: string;
}

export interface BackendPackageResponse {
  success: boolean;
  data: BackendPackage;
}

export interface BackendPackagesPaginatedResponse {
  success: boolean;
  data: BackendPackageList[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
