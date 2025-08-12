import { BusinessRepository } from '../ports/BusinessRepository';

export class DeleteBusinessUseCase {
  constructor(private businessRepository: BusinessRepository) {}

  async execute(id: number): Promise<void> {
    try {
      // Validaciones básicas
      if (!id || id <= 0) {
        throw new Error('ID de negocio inválido');
      }

      await this.businessRepository.deleteBusiness(id);
    } catch (error) {
      console.error('Error deleting business:', error);
      throw error;
    }
  }
} 