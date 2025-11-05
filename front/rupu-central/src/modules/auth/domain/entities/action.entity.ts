/**
 * Entidad de dominio: Action (Acción)
 */

export interface Action {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ActionsList {
  actions: Action[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface GetActionsParams {
  token: string;
  page?: number;
  page_size?: number;
  name?: string;
}

export interface GetActionByIdParams {
  token: string;
  actionId: number;
}

export interface CreateActionParams {
  token: string;
  name: string;
  description: string;
}

export interface CreateActionResponse {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateActionParams {
  token: string;
  actionId: number;
  name: string;
  description: string;
}

export interface UpdateActionResponse {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DeleteActionParams {
  token: string;
  actionId: number;
}

export interface DeleteActionResponse {
  success: boolean;
  message: string;
}

