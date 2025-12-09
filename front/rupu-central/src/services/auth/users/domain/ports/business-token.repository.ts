/**
 * Puerto para obtener business token
 */

import { BusinessTokenParams, BusinessTokenResult } from '../../entities/business-token.entity';

export interface IBusinessTokenRepository {
  getBusinessToken(params: BusinessTokenParams): Promise<BusinessTokenResult>;
}

export type { BusinessTokenParams, BusinessTokenResult };
