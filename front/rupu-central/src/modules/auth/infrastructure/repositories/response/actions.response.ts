/**
 * Interfaces de respuesta del backend para Actions
 */

export interface BackendAction {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface BackendActionsResponse {
  success: boolean;
  message: string;
  data: {
    actions: BackendAction[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}

export interface BackendGetActionByIdResponse {
  success: boolean;
  message: string;
  data: BackendAction;
}

export interface BackendCreateActionResponse {
  success: boolean;
  message: string;
  data: BackendAction;
}

export interface BackendUpdateActionResponse {
  success: boolean;
  message: string;
  data: BackendAction;
}

export interface BackendDeleteActionResponse {
  success: boolean;
  message: string;
}

