import { HttpClient } from '@/shared/adapters/http/HttpClient';
import { config } from '@/shared/config/env';

export class TableService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(config.API_BASE_URL);
  }

  async getTables() {
    const response = await this.httpClient.get('/api/v1/tables');
    return response.data || [];
  }
}
