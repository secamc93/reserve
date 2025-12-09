/**
 * Interfaces de request para get-user-by-id action
 */

import { GetUserByIdParams } from '../../../../domain/entities/get-user-by-id.entity';

export interface GetUserByIdInput extends Omit<GetUserByIdParams, 'token'> {
  token: string;
}
