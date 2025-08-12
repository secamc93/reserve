import { BusinessRepository } from '../ports/BusinessRepository';
import { Business } from '../domain/Business';

export class GetBusinessesUseCase {
  constructor(private businessRepository: BusinessRepository) {}

  async execute(): Promise<Business[]> {
    try {
      return await this.businessRepository.getBusinesses();
    } catch (error) {
      console.error('Error getting businesses:', error);
      throw new Error('No se pudieron obtener los negocios');
    }
  }
}
