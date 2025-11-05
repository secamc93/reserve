/**
 * Interfaces de request para update-user action
 */

import { UpdateUserParams } from '../../../../domain/entities/update-user.entity';

export interface UpdateUserInput extends Omit<UpdateUserParams, 'token'> {
  token: string;
}

