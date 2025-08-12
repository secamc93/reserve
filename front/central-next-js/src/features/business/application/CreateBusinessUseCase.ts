import { BusinessRepository } from '../ports/BusinessRepository';
import { Business, CreateBusinessRequest } from '../domain/Business';

export class CreateBusinessUseCase {
  constructor(private businessRepository: BusinessRepository) {}

  async execute(businessData: CreateBusinessRequest): Promise<Business> {
    try {
      // Validaciones básicas
      if (!businessData.name || !businessData.code || !businessData.businessTypeId) {
        throw new Error('Nombre, código y tipo de negocio son requeridos');
      }

      return await this.businessRepository.createBusiness(businessData);
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  }
} 