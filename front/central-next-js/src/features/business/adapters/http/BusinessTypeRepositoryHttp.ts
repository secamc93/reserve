import { BusinessTypeRepository } from '../../ports/BusinessTypeRepository';
import { BusinessType, CreateBusinessTypeRequest, UpdateBusinessTypeRequest } from '../../domain/Business';
import { BusinessTypeService } from './BusinessTypeService';

export class BusinessTypeRepositoryHttp implements BusinessTypeRepository {
  private businessTypeService: BusinessTypeService;

  constructor() {
    this.businessTypeService = new BusinessTypeService();
  }

  async getBusinessTypes(): Promise<BusinessType[]> {
    return this.businessTypeService.getBusinessTypes();
  }

  async getBusinessTypeById(id: number): Promise<BusinessType> {
    return this.businessTypeService.getBusinessTypeById(id);
  }

  async createBusinessType(businessType: CreateBusinessTypeRequest): Promise<BusinessType> {
    return this.businessTypeService.createBusinessType(businessType);
  }

  async updateBusinessType(id: number, businessType: UpdateBusinessTypeRequest): Promise<BusinessType> {
    return this.businessTypeService.updateBusinessType(id, businessType);
  }

  async deleteBusinessType(id: number): Promise<void> {
    return this.businessTypeService.deleteBusinessType(id);
  }
} 