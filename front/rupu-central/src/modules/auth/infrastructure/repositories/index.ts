/**
 * Infrastructure Layer - Auth Repositories
 */

import { UsersRepository } from './users';
import { PermissionsRepository } from './permissions';
import { RolesRepository } from './roles';
import { ResourcesRepository } from './resources';

// Repositorio Principal de Auth con todos los módulos
export class AuthRepository {
  public users: UsersRepository;
  public permissions: PermissionsRepository;
  public roles: RolesRepository;
  public resources: ResourcesRepository;

  constructor() {
    this.users = new UsersRepository();
    this.permissions = new PermissionsRepository();
    this.roles = new RolesRepository();
    this.resources = new ResourcesRepository();
  }
}

// Exportar repositorios individuales
export * from './permissions';
export * from './roles';
export * from './users';
export * from './resources';
