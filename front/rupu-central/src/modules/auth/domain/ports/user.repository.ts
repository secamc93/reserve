/**
 * Puerto (interfaz) para el repositorio de usuarios
 * Define el contrato que debe cumplir cualquier implementación
 */

import { User, CreateUserDTO, UpdateUserDTO } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
  findAll(): Promise<User[]>;
}

