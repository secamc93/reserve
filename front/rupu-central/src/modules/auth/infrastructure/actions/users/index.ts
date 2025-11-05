/**
 * Infrastructure Layer - Users Actions
 * IMPORTANTE: No importar en Client Components
 */

import { AuthUseCases, AuthUseCasesInput } from '../../../application';
import { loginAction } from './login.action';
import { getUsersAction } from './get-users.action';
import { createUserAction } from './create-user.action';
import { deleteUserAction } from './delete-user.action';
import { updateUserAction } from './update-user.action';
import { getUserByIdAction } from './get-user-by-id.action';
import { businessTokenAction } from './business-token.action';
import { generatePasswordAction } from './generate-password.action';
import { assignUserRoleAction } from './assign-user-role.action';

// Interfaz para actions de usuarios
export interface UsersActionsInput {
  login: (input: Parameters<typeof loginAction>[0]) => ReturnType<typeof loginAction>;
  getUsers: (input: Parameters<typeof getUsersAction>[0]) => ReturnType<typeof getUsersAction>;
  createUser: (input: Parameters<typeof createUserAction>[0]) => ReturnType<typeof createUserAction>;
  deleteUser: (input: Parameters<typeof deleteUserAction>[0]) => ReturnType<typeof deleteUserAction>;
  updateUser: (input: Parameters<typeof updateUserAction>[0]) => ReturnType<typeof updateUserAction>;
  getUserById: (input: Parameters<typeof getUserByIdAction>[0]) => ReturnType<typeof getUserByIdAction>;
  businessToken: (input: Parameters<typeof businessTokenAction>[0], sessionToken: string) => ReturnType<typeof businessTokenAction>;
  generatePassword: (input: Parameters<typeof generatePasswordAction>[0]) => ReturnType<typeof generatePasswordAction>;
  assignUserRole: (input: Parameters<typeof assignUserRoleAction>[0]) => ReturnType<typeof assignUserRoleAction>;
}

// Constructor centralizado para actions de usuarios
export class UsersActions implements UsersActionsInput {
  private authUseCases: AuthUseCasesInput;

  constructor(authUseCases: AuthUseCasesInput) {
    this.authUseCases = authUseCases;
  }

  // Login
  async login(input: Parameters<typeof loginAction>[0]) {
    return loginAction(input, this.authUseCases);
  }

  // Get Users
  async getUsers(input: Parameters<typeof getUsersAction>[0]) {
    return getUsersAction(input, this.authUseCases);
  }

  // Create User
  async createUser(input: Parameters<typeof createUserAction>[0]) {
    return createUserAction(input, this.authUseCases);
  }

  // Delete User
  async deleteUser(input: Parameters<typeof deleteUserAction>[0]) {
    return deleteUserAction(input, this.authUseCases);
  }

  // Update User
  async updateUser(input: Parameters<typeof updateUserAction>[0]) {
    return updateUserAction(input, this.authUseCases);
  }

  // Get User by ID
  async getUserById(input: Parameters<typeof getUserByIdAction>[0]) {
    return getUserByIdAction(input, this.authUseCases);
  }

  // Business Token
  async businessToken(input: Parameters<typeof businessTokenAction>[0], sessionToken: string) {
    return businessTokenAction(input, sessionToken);
  }

  // Generate Password
  async generatePassword(input: Parameters<typeof generatePasswordAction>[0]) {
    return generatePasswordAction(input, this.authUseCases);
  }

  // Assign User Role
  async assignUserRole(input: Parameters<typeof assignUserRoleAction>[0]) {
    return assignUserRoleAction(input, this.authUseCases);
  }
}

// Exportar actions individuales
export * from './login.action';
export * from './get-users.action';
export * from './create-user.action';
export * from './delete-user.action';
export * from './update-user.action';
export * from './get-user-by-id.action';
export * from './business-token.action';
export * from './generate-password.action';
export * from './assign-user-role.action';

// Exportar interfaces de request y response
export * from './request';
export * from './response';
