/**
 * Interfaces de response para update-user action
 */

import { UpdateUserResponse } from '../../../../domain/entities/update-user.entity';

export interface UpdateUserActionResult {
  success: boolean;
  data?: UpdateUserResponse;
  error?: string;
}

