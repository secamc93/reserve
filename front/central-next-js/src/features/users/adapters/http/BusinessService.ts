import { HttpClient } from '@/shared/adapters/http/HttpClient';
import { config } from '@/shared/config/env';
import { Business } from '@/features/users/domain/User';

export class BusinessService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(config.API_BASE_URL);
    console.log('BusinessService initialized with base URL:', config.API_BASE_URL);
  }

  async getBusinesses(): Promise<Business[]> {
    try {
      console.log('BusinessService: Getting businesses');
      
      const response = await this.httpClient.get('/api/v1/businesses');
      console.log('BusinessService: Businesses response:', response);
      
      return response.data || [];
    } catch (error) {
      console.error('BusinessService: Error getting businesses:', error);
      return [];
    }
  }

  async getBusinessById(id: number): Promise<Business | null> {
    try {
      console.log('BusinessService: Getting business ID:', id);
      const response = await this.httpClient.get(`/api/v1/businesses/${id}`);
      console.log('BusinessService: Business response:', response);
      return response;
    } catch (error) {
      console.error('BusinessService: Error getting business:', error);
      return null;
    }
  }
} 