import { HttpClient } from '@/shared/adapters/http/HttpClient';
import { BusinessType, CreateBusinessTypeRequest, UpdateBusinessTypeRequest } from '../../domain/Business';

export class BusinessTypeService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3050');
  }

  async getBusinessTypes(): Promise<BusinessType[]> {
    const response = await this.httpClient.get('/business-types');
    return response.data;
  }

  async getBusinessTypeById(id: number): Promise<BusinessType> {
    const response = await this.httpClient.get(`/business-types/${id}`);
    return response.data;
  }

  async createBusinessType(businessType: CreateBusinessTypeRequest): Promise<BusinessType> {
    const response = await this.httpClient.post('/business-types', businessType);
    return response.data;
  }

  async updateBusinessType(id: number, businessType: UpdateBusinessTypeRequest): Promise<BusinessType> {
    const response = await this.httpClient.put(`/business-types/${id}`, businessType);
    return response.data;
  }

  async deleteBusinessType(id: number): Promise<void> {
    await this.httpClient.delete(`/business-types/${id}`);
  }
} 