/**
 * Entidades para asignar roles a usuarios en negocios
 */

export interface UserRoleAssignment {
  business_id: number;
  role_id: number;
}

export interface AssignUserRoleParams {
  token: string;
  user_id: number;
  assignments: UserRoleAssignment[];
}

export interface AssignUserRoleResponse {
  success: boolean;
  message: string;
}

