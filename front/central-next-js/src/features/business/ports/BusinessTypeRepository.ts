import { BusinessType, CreateBusinessTypeRequest, UpdateBusinessTypeRequest } from '../domain/Business';

export interface BusinessTypeRepository {
  getBusinessTypes(): Promise<BusinessType[]>;
  getBusinessTypeById(id: number): Promise<BusinessType>;
  createBusinessType(businessType: CreateBusinessTypeRequest): Promise<BusinessType>;
  updateBusinessType(id: number, businessType: UpdateBusinessTypeRequest): Promise<BusinessType>;
  deleteBusinessType(id: number): Promise<void>;
} 