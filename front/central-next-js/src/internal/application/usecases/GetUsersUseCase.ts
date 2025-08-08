import { UserRepository } from '../../domain/ports/UserRepository';
import { UserFilters, UserListDTO } from '../../domain/entities/User';

export class GetUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(filters: UserFilters = {}): Promise<UserListDTO> {
    try {
      console.log('GetUsersUseCase: Executing with filters:', filters);

      // Business validations
      if (filters.page && filters.page < 1) {
        throw new Error('Page must be greater than 0');
      }

      if (filters.pageSize && (filters.pageSize < 1 || filters.pageSize > 100)) {
        throw new Error('Page size must be between 1 and 100');
      }

      const result = await this.userRepository.getUsers(filters);

      console.log('GetUsersUseCase: Result:', result);

      return result;
    } catch (error) {
      console.error('GetUsersUseCase: Error:', error);
      return {
        users: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };
    }
  }
} 