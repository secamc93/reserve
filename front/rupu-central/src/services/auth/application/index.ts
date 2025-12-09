/**
 * Application Layer - Auth Use Cases
 */

import { UsersUseCases, UsersUseCasesInput } from './users';
import { AuthRepository } from '../infrastructure/repositories';

// Interfaz para el constructor principal de Auth
export interface AuthUseCasesInput {
  users: UsersUseCasesInput;
}

// Constructor centralizado para todos los casos de uso de Auth
export class AuthUseCases implements AuthUseCasesInput {
  public users: UsersUseCases;

  constructor() {
    const authRepository = new AuthRepository();
    this.users = new UsersUseCases(authRepository.users, authRepository.users);
  }
}

// Exportar módulos individuales
export * from './permissions';
export * from './roles';
export * from './users';
export * from './resources';

