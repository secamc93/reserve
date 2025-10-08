/**
 * Entidad User (Domain)
 * Representa un usuario en el dominio de negocio
 */

import { Role } from '@config/rbac';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface UpdateUserDTO {
  name?: string;
  role?: Role;
}

