/**
 * Puerto para el repositorio de usuarios
 */

import { UsersList, GetUsersParams } from '../../entities/user-list.entity';
import { CreateUserParams, CreateUserResponse } from '../../entities/create-user.entity';
import { DeleteUserParams, DeleteUserResponse } from '../../entities/delete-user.entity';
import { UpdateUserParams, UpdateUserResponse } from '../../entities/update-user.entity';
import { GetUserByIdParams, GetUserByIdResponse } from '../../entities/get-user-by-id.entity';
import { LoginResponse } from '../../entities/user.entity';

export interface IUsersRepository {
  getUsers(params: GetUsersParams): Promise<UsersList>;
  createUser(params: CreateUserParams): Promise<CreateUserResponse>;
  login(email: string, password: string): Promise<LoginResponse>;
  deleteUser(params: DeleteUserParams): Promise<DeleteUserResponse>;
  updateUser(params: UpdateUserParams): Promise<UpdateUserResponse>;
  getUserById(params: GetUserByIdParams): Promise<GetUserByIdResponse>;
}

export type { GetUsersParams, CreateUserParams, DeleteUserParams, UpdateUserParams, GetUserByIdParams };
