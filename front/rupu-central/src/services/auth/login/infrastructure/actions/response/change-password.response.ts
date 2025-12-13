/**
 * Interfaces de response para change password action
 */

export interface ChangePasswordActionResult {
  success: boolean;
  data?: {
    message: string;
  };
  error?: string;
}

