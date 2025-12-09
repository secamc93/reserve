/**
 * Interfaces de response para delete-user action
 */

import { DeleteUserResponse } from '../../../../domain/entities/delete-user.entity';

export interface DeleteUserActionResult {
  success: boolean;
  data?: DeleteUserResponse;
  error?: string;
}
