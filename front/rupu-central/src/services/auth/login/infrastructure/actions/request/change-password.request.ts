/**
 * Interfaces de request para change password action
 */

export interface ChangePasswordActionInput {
  current_password: string;
  new_password: string;
  session_token: string;
}


