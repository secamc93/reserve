import { HttpClient } from '@/shared/adapters/http/HttpClient';
import { Business, CreateBusinessRequest, UpdateBusinessRequest } from '../../domain/Business';

export class BusinessService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3050');
  }

  async getBusinesses(): Promise<Business[]> {
    const response = await this.httpClient.get('/businesses');
    return response.data;
  }

  async getBusinessById(id: number): Promise<Business> {
    const response = await this.httpClient.get(`/businesses/${id}`);
    return response.data;
  }

  async createBusiness(business: CreateBusinessRequest): Promise<Business> {
    const response = await this.httpClient.post('/businesses', business);
    return response.data;
  }

  async updateBusiness(id: number, business: UpdateBusinessRequest): Promise<Business> {
    const response = await this.httpClient.put(`/businesses/${id}`, business);
    return response.data;
  }

  async deleteBusiness(id: number): Promise<void> {
    await this.httpClient.delete(`/businesses/${id}`);
  }
}
