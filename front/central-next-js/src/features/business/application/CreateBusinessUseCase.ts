import { BusinessRepository } from '../ports/BusinessRepository';
import { Business, CreateBusinessRequest } from '../domain/Business';

export class CreateBusinessUseCase {
  constructor(private businessRepository: BusinessRepository) {}

  async execute(businessData: CreateBusinessRequest | FormData): Promise<Business> {
    try {
      // Validaciones básicas
      if (businessData instanceof FormData) {
        const name = businessData.get('name') as string;
        const businessTypeId = businessData.get('business_type_id') as string;
        
        if (!name || !businessTypeId) {
          throw new Error('Nombre y tipo de negocio son requeridos');
        }
      } else {
        if (!businessData.name || !businessData.business_type_id) {
          throw new Error('Nombre y tipo de negocio son requeridos');
        }
      }

      return await this.businessRepository.createBusiness(businessData);
    } catch (error) {
      console.error('Error creating business:', error);
      throw error;
    }
  }
} 