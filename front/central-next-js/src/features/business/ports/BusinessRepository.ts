import { Business, CreateBusinessRequest, UpdateBusinessRequest } from '../domain/Business';

export interface BusinessRepository {
  getBusinesses(): Promise<Business[]>;
  getBusinessById(id: number): Promise<Business>;
  createBusiness(business: CreateBusinessRequest | FormData): Promise<Business>;
  updateBusiness(id: number, business: UpdateBusinessRequest | FormData): Promise<Business>;
  deleteBusiness(id: number): Promise<void>;
}
