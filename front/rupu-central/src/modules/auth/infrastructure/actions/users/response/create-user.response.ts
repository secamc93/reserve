/**
 * Interfaces de response para create-user action
 */

export interface CreateUserResult {
  success: boolean;
  data?: {
    email: string;
    password: string;
    message: string;
  };
  error?: string;
}
