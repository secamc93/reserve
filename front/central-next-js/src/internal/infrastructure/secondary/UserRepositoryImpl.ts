import { UserRepository } from '../../domain/ports/UserRepository';
import { UserService } from './UserService';
import { User, CreateUserDTO, UpdateUserDTO, UserFilters, UserListDTO, Role } from '../../domain/entities/User';

export class UserRepositoryImpl implements UserRepository {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
    console.log('UserRepositoryImpl initialized');
  }

  async getUsers(filters: UserFilters = {}): Promise<UserListDTO> {
    try {
      console.log('🔍 UserRepositoryImpl: Getting users with filters:', filters);
      
      const result = await this.userService.getUsers(filters);
      console.log('🔍 UserRepositoryImpl: Service result:', result);
      
      if (!result) {
        console.warn('🔍 UserRepositoryImpl: No result from service');
        throw new Error('No response from API');
      }

      if (!Array.isArray(result.users)) {
        console.warn('🔍 UserRepositoryImpl: Users is not an array:', result.users);
        throw new Error('Invalid users format from API');
      }

      const response = {
        users: result.users,
        total: result.total || 0,
        page: result.page || 1,
        pageSize: result.pageSize || 10,
        totalPages: result.totalPages || 1
      };

      console.log('🔍 UserRepositoryImpl: Returning formatted response:', response);
      return response;
    } catch (error) {
      console.error('🔍 UserRepositoryImpl: Error getting users:', error);
      throw error; // Re-throw para que el hook maneje el error
    }
  }

  async getUserById(id: number): Promise<User> {
    try {
      console.log('UserRepositoryImpl: Getting user ID:', id);
      
      const result = await this.userService.getUserById(id);
      
      if (!result) {
        throw new Error('User not found');
      }

      return result;
    } catch (error) {
      console.error('UserRepositoryImpl: Error getting user:', error);
      throw error;
    }
  }

  async createUser(userData: CreateUserDTO): Promise<{ success: boolean; userId?: number; email?: string; password?: string; message?: string }> {
    try {
      console.log('UserRepositoryImpl: Creating user:', userData);
      
      const result = await this.userService.createUser(userData);
      
      if (!result || !result.success) {
        throw new Error(result?.message || 'Error creating user');
      }

      return {
        success: true,
        userId: result.userId,
        email: result.email,
        password: result.password,
        message: result.message || 'User created successfully'
      };
    } catch (error) {
      console.error('UserRepositoryImpl: Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: UpdateUserDTO): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('UserRepositoryImpl: Updating user ID:', id, 'Data:', userData);
      
      const result = await this.userService.updateUser(id, userData);
      
      if (!result || !result.success) {
        throw new Error(result?.message || 'Error updating user');
      }

      return {
        success: true,
        message: result.message || 'User updated successfully'
      };
    } catch (error) {
      console.error('UserRepositoryImpl: Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('UserRepositoryImpl: Deleting user ID:', id);
      
      const result = await this.userService.deleteUser(id);
      
      if (!result || !result.success) {
        throw new Error(result?.message || 'Error deleting user');
      }

      return {
        success: true,
        message: result.message || 'User deleted successfully'
      };
    } catch (error) {
      console.error('UserRepositoryImpl: Error deleting user:', error);
      throw error;
    }
  }

  async getRoles(): Promise<Role[]> {
    try {
      console.log('UserRepositoryImpl: Getting roles');
      
      const result = await this.userService.getRoles();
      
      if (!Array.isArray(result)) {
        console.warn('UserRepositoryImpl: Roles result is not an array:', result);
        return [];
      }

      return result;
    } catch (error) {
      console.error('UserRepositoryImpl: Error getting roles:', error);
      return [];
    }
  }
} 