/**
 * Puerto: Repositorio de Create Business Type
 */

import { CreateBusinessTypeInput, CreateBusinessTypeResult } from '../../entities';

export interface ICreateBusinessTypeRepository {
  createBusinessType(input: CreateBusinessTypeInput, token: string): Promise<CreateBusinessTypeResult>;
}
