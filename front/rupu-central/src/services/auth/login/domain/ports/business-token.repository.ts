/**
 * Puerto de dominio: Repositorio de Business Token
 */

import { BusinessTokenRequest, BusinessTokenResponse } from '../entities';

export interface BusinessTokenParams {
  business_id: number;
  token: string; // Session token
}

export interface IBusinessTokenRepository {
  getBusinessToken(params: BusinessTokenParams): Promise<BusinessTokenResponse>;
}
