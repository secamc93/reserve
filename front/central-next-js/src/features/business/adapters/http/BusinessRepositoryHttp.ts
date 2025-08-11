import { BusinessRepository } from '@/features/business/ports/BusinessRepository';
import { BusinessListDTO } from '@/features/business/domain/Business';
import { BusinessService } from './BusinessService';

export class BusinessRepositoryHttp implements BusinessRepository {
  private service: BusinessService;

  constructor() {
    this.service = new BusinessService();
  }

  async getBusinesses(): Promise<BusinessListDTO> {
    const result = await this.service.getBusinesses();
    return {
      businesses: result.businesses || [],
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || 10,
    };
  }
}
