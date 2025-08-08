import { User, CreateUserDTO, UpdateUserDTO, UserFilters, UserListDTO, Role } from '../entities/User';

export interface UserRepository {
  getUsers(filters?: UserFilters): Promise<UserListDTO>;
  getUserById(id: number): Promise<User>;
  createUser(userData: CreateUserDTO): Promise<{ success: boolean; userId?: number; email?: string; password?: string; message?: string }>;
  updateUser(id: number, userData: UpdateUserDTO): Promise<{ success: boolean; message?: string }>;
  deleteUser(id: number): Promise<{ success: boolean; message?: string }>;
  getRoles(): Promise<Role[]>;
} 