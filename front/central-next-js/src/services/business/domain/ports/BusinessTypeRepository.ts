import { BusinessType, CreateBusinessTypeRequest, UpdateBusinessTypeRequest } from '../entities/Business';

export interface BusinessTypeRepository {
  getBusinessTypes(): Promise<BusinessType[]>;
  getBusinessTypeById(id: number): Promise<BusinessType>;
  createBusinessType(businessType: CreateBusinessTypeRequest): Promise<BusinessType>;
  updateBusinessType(id: number, businessType: UpdateBusinessTypeRequest): Promise<BusinessType>;
  deleteBusinessType(id: number): Promise<void>;
} 