import { UserRepository } from '@/services/users/domain/ports/UserRepository';
import { CreateUserDTO } from '@/services/users/domain/entities/User';

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userData: CreateUserDTO): Promise<{ success: boolean; userId?: number; email?: string; password?: string; message?: string }> {
    try {
      console.log('CreateUserUseCase: Executing with data:', userData);

      // 1. Prepare data exactly as expected by API
      const processedData: CreateUserDTO = {
        name: userData.name.trim(),
        email: userData.email.trim(),
        phone: userData.phone ? userData.phone.trim() : '',
        businessIds: userData.businessIds || [],
        roleIds: userData.roleIds || [],
        isActive: userData.isActive !== undefined ? userData.isActive : true,
        avatarFile: userData.avatarFile,
        avatarURL: userData.avatarURL
      };

      // 2. Validate data
      this.validateUserData(processedData);

      const result = await this.userRepository.createUser(processedData);

      console.log('CreateUserUseCase: User created successfully');

      return result;
    } catch (error) {
      console.error('CreateUserUseCase: Error:', error);
      throw error;
    }
  }

  private validateUserData(data: CreateUserDTO): void {
    // Validate required fields
    const requiredFields = ['name', 'email'];

    for (const field of requiredFields) {
      if (!data[field as keyof CreateUserDTO] || (typeof data[field as keyof CreateUserDTO] === 'string' && (data[field as keyof CreateUserDTO] as string).trim() === '')) {
        throw new Error(`The ${this.getFieldName(field)} field is required`);
      }
    }

    // Validate roles
    if (!data.roleIds || data.roleIds.length === 0) {
      throw new Error('At least one role must be selected');
    }

    // Validate businesses
    if (!data.businessIds || data.businessIds.length === 0) {
      throw new Error('At least one business must be selected');
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error('Email format is not valid');
    }
  }

  // Helper function to get friendly field names
  private getFieldName(field: string): string {
    const names: { [key: string]: string } = {
      name: 'full name',
      email: 'email',
      phone: 'phone',
    };
    return names[field] || field;
  }
} 