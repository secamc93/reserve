import { BusinessRepository } from '../../ports/BusinessRepository';
import { Business, CreateBusinessRequest, UpdateBusinessRequest } from '../../domain/Business';
import { BusinessService } from './BusinessService';

export class BusinessRepositoryHttp implements BusinessRepository {
  private businessService: BusinessService;

  constructor() {
    this.businessService = new BusinessService();
  }

  async getBusinesses(): Promise<Business[]> {
    return this.businessService.getBusinesses();
  }

  async getBusinessById(id: number): Promise<Business> {
    return this.businessService.getBusinessById(id);
  }

  async createBusiness(business: CreateBusinessRequest | FormData): Promise<Business> {
    return this.businessService.createBusiness(business);
  }

  async updateBusiness(id: number, business: UpdateBusinessRequest | FormData): Promise<Business> {
    return this.businessService.updateBusiness(id, business);
  }

  async deleteBusiness(id: number): Promise<void> {
    return this.businessService.deleteBusiness(id);
  }
}
