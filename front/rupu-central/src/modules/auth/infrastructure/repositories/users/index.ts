/**
 * Infrastructure Layer - Users Repositories
 */

import { IUsersRepository, GetUsersParams, CreateUserParams, DeleteUserParams, UpdateUserParams, GetUserByIdParams } from '../../../domain/ports/users/users.repository';
import { ILoginRepository } from '../../../domain/ports/users/login.repository';
import { UsersList } from '../../../domain/entities/user-list.entity';
import { CreateUserResponse } from '../../../domain/entities/create-user.entity';
import { DeleteUserResponse } from '../../../domain/entities/delete-user.entity';
import { UpdateUserResponse } from '../../../domain/entities/update-user.entity';
import { GetUserByIdResponse } from '../../../domain/entities/get-user-by-id.entity';
import { LoginResponse } from '../../../domain/entities/user.entity';
import { GetUsersRepository } from './get-users.repository';
import { CreateUserRepository } from './create-user.repository';
import { LoginRepository } from './login.repository';
import { DeleteUserRepository } from './delete-user.repository';
import { UpdateUserRepository } from './update-user.repository';
import { GetUserByIdRepository } from './get-user-by-id.repository';

// Repositorio Principal de Usuarios con delegación
export class UsersRepository implements IUsersRepository {
  private getUsersRepository: GetUsersRepository;
  private createUserRepository: CreateUserRepository;
  private loginRepository: LoginRepository;
  private deleteUserRepository: DeleteUserRepository;
  private updateUserRepository: UpdateUserRepository;
  private getUserByIdRepository: GetUserByIdRepository;

  constructor() {
    this.getUsersRepository = new GetUsersRepository();
    this.createUserRepository = new CreateUserRepository();
    this.loginRepository = new LoginRepository();
    this.deleteUserRepository = new DeleteUserRepository();
    this.updateUserRepository = new UpdateUserRepository();
    this.getUserByIdRepository = new GetUserByIdRepository();
  }

  async getUsers(params: GetUsersParams): Promise<UsersList> {
    return this.getUsersRepository.getUsers(params);
  }

  async createUser(params: CreateUserParams): Promise<CreateUserResponse> {
    return this.createUserRepository.createUser(params);
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.loginRepository.login(email, password);
  }

  async deleteUser(params: DeleteUserParams): Promise<DeleteUserResponse> {
    return this.deleteUserRepository.deleteUser(params);
  }

  async updateUser(params: UpdateUserParams): Promise<UpdateUserResponse> {
    return this.updateUserRepository.updateUser(params);
  }

  async getUserById(params: GetUserByIdParams): Promise<GetUserByIdResponse> {
    return this.getUserByIdRepository.getUserById(params);
  }
}

// Exportar repositorios específicos
export * from './login.repository';
export * from './get-users.repository';
export * from './create-user.repository';
export * from './delete-user.repository';
export * from './update-user.repository';
export * from './get-user-by-id.repository';
