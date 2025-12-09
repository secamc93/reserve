/**
 * Puerto: Repositorio de Business Types
 */

import { GetBusinessTypesResult } from '../../entities';

export interface IBusinessTypesRepository {
  getBusinessTypes(token: string): Promise<GetBusinessTypesResult>;
}
