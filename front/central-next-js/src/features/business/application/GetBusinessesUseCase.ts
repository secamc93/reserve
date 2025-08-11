import { BusinessRepository } from '@/features/business/ports/BusinessRepository';
import { BusinessListDTO } from '@/features/business/domain/Business';

export class GetBusinessesUseCase {
  constructor(private businessRepository: BusinessRepository) {}

  async execute(): Promise<BusinessListDTO> {
    try {
      const result = await this.businessRepository.getBusinesses();
      return result;
    } catch (error) {
      console.error('GetBusinessesUseCase: Error:', error);
      return { businesses: [], total: 0, page: 1, limit: 10 };
    }
  }
}
