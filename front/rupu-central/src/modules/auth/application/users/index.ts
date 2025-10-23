/**
 * Application Layer - Users Use Cases
 */

import { IUsersRepository } from '../../domain/ports/users/users.repository';
import { ILoginRepository } from '../../domain/ports/users/login.repository';
import { LoginUseCase } from './login.use-case';
import { GetUsersUseCase } from './get-users.use-case';
import { CreateUserUseCase } from './create-user.use-case';
import { DeleteUserUseCase } from './delete-user.use-case';
import { UpdateUserUseCase } from './update-user.use-case';
import { GetUserByIdUseCase } from './get-user-by-id.use-case';

export interface UsersUseCasesInput {
    UseCaseCreateUser: CreateUserUseCase;
    UseCaseDeleteUser: DeleteUserUseCase;
    UseCaseUpdateUser: UpdateUserUseCase;
    UseCaseGetUserById: GetUserByIdUseCase;
    UseCaseGetUsers: GetUsersUseCase;
    UseCaseLogin: LoginUseCase;
}

// Constructor centralizado para casos de uso de usuarios
export class UsersUseCases implements UsersUseCasesInput {
  public UseCaseLogin: LoginUseCase;
  public UseCaseGetUsers: GetUsersUseCase;
  public UseCaseCreateUser: CreateUserUseCase;
  public UseCaseDeleteUser: DeleteUserUseCase;
  public UseCaseUpdateUser: UpdateUserUseCase;
  public UseCaseGetUserById: GetUserByIdUseCase;

  constructor(usersRepository: IUsersRepository, loginRepository: ILoginRepository) {
    this.UseCaseLogin = new LoginUseCase(loginRepository);
    this.UseCaseGetUsers = new GetUsersUseCase(usersRepository);
    this.UseCaseCreateUser = new CreateUserUseCase(usersRepository);
    this.UseCaseDeleteUser = new DeleteUserUseCase(usersRepository);
    this.UseCaseUpdateUser = new UpdateUserUseCase(usersRepository);
    this.UseCaseGetUserById = new GetUserByIdUseCase(usersRepository);
  }

  // Métodos de conveniencia que delegan a los casos de uso
  get login() { return this.UseCaseLogin; }
  get getUsers() { return this.UseCaseGetUsers; }
  get createUser() { return this.UseCaseCreateUser; }
  get deleteUser() { return this.UseCaseDeleteUser; }
  get updateUser() { return this.UseCaseUpdateUser; }
  get getUserById() { return this.UseCaseGetUserById; }
}

// Exportar casos de uso individuales
export * from './login.use-case';
export * from './get-users.use-case';
export * from './create-user.use-case';
export * from './delete-user.use-case';
export * from './update-user.use-case';
export * from './get-user-by-id.use-case';
