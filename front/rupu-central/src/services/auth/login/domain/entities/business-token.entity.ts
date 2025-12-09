/**
 * Entidades del dominio para Business Token
 */

export interface BusinessTokenRequest {
  business_id: number;
}

export interface BusinessTokenResponse {
  token: string;
}
