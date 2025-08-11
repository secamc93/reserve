import { HttpClient } from '@/shared/adapters/http/HttpClient';
import { config } from '@/shared/config/env';

export class RoomService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(config.API_BASE_URL);
  }

  async getRooms() {
    const response = await this.httpClient.get('/api/v1/rooms');
    return response.data || [];
  }
}
