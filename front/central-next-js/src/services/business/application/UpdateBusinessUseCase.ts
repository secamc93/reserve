import { BusinessRepository } from '../domain/ports/BusinessRepository';
import { Business, UpdateBusinessRequest } from '../domain/entities/Business';

export class UpdateBusinessUseCase {
  constructor(private businessRepository: BusinessRepository) {}

  async execute(id: number, businessData: UpdateBusinessRequest | FormData): Promise<Business> {
    try {
      // Validaciones básicas
      if (!id || id <= 0) {
        throw new Error('ID de negocio inválido');
      }

      return await this.businessRepository.updateBusiness(id, businessData);
    } catch (error) {
      console.error('Error updating business:', error);
      throw error;
    }
  }
} 