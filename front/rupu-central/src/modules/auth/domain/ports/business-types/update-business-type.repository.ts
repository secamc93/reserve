/**
 * Puerto: Repositorio de Update Business Type
 */

import { UpdateBusinessTypeInput, UpdateBusinessTypeResult } from '../../entities';

export interface IUpdateBusinessTypeRepository {
  updateBusinessType(input: UpdateBusinessTypeInput, token: string): Promise<UpdateBusinessTypeResult>;
}
