/**
 * Puerto: Repositorio de Delete Business Type
 */

import { DeleteBusinessTypeInput, DeleteBusinessTypeResult } from '../../entities';

export interface IDeleteBusinessTypeRepository {
  deleteBusinessType(input: DeleteBusinessTypeInput, token: string): Promise<DeleteBusinessTypeResult>;
}
