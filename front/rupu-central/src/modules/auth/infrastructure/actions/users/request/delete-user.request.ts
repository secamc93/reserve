/**
 * Interfaces de request para delete-user action
 */

import { DeleteUserParams } from '../../../../domain/entities/delete-user.entity';

export interface DeleteUserInput extends Omit<DeleteUserParams, 'token'> {
  token: string;
}
