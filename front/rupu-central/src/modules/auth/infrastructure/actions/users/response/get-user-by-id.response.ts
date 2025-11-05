/**
 * Interfaces de response para get-user-by-id action
 */

import { GetUserByIdResponse } from '../../../../domain/entities/get-user-by-id.entity';

export interface GetUserByIdActionResult {
  success: boolean;
  data?: GetUserByIdResponse;
  error?: string;
}
