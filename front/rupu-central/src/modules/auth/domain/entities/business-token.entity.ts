/**
 * Entidad para obtener business token
 */

export interface BusinessTokenInput {
  business_id: number;
}

export interface BusinessTokenResult {
  success: boolean;
  data?: {
    token: string;
  };
  error?: string;
}

export interface BusinessTokenParams {
  business_id: number;
  token: string; // Token principal de sesión
}
