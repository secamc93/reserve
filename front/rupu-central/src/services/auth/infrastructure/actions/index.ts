/**
 * Infrastructure Layer - Auth Actions
 * IMPORTANTE: No importar en Client Components
 */

import { UsersActions, UsersActionsInput } from './users';
import { AuthUseCases, AuthUseCasesInput } from '../../application';

// Interfaz para el constructor principal de Auth Actions
export interface AuthActionsInput {
  users: UsersActionsInput;
}

// Constructor centralizado para todos los actions de Auth
export class AuthActions implements AuthActionsInput {
  public users: UsersActions;

  constructor(authUseCases: AuthUseCasesInput) {
    this.users = new UsersActions(authUseCases);
  }

  // Método estático para crear instancia con dependencias resueltas
  static create(): AuthActions {
    const authUseCases = new AuthUseCases();
    return new AuthActions(authUseCases);
  }
}

// Exportar módulos individuales
export * from './permissions';
export * from './roles';
export * from './users';
export * from './resources';
export * from './actions';

