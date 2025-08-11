import { HttpClient } from '@/shared/adapters/http/HttpClient';
import { config } from '@/shared/config/env';

export class BusinessService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(config.API_BASE_URL);
    console.log('BusinessService initialized with base URL:', config.API_BASE_URL);
  }

  async getBusinesses() {
    try {
      const response = await this.httpClient.get('/api/v1/businesses');
      return response.data || { businesses: [], total: 0, page: 1, limit: 10 };
    } catch (error) {
      console.error('BusinessService: Error getting businesses:', error);
      throw error;
    }
  }
}
