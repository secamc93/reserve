import { Room } from '@/features/rooms/domain/Room';
import { RoomRepository } from '@/features/rooms/ports/RoomRepository';
import { RoomService } from './RoomService';

export class RoomRepositoryHttp implements RoomRepository {
  private service: RoomService;

  constructor() {
    this.service = new RoomService();
  }

  async getRooms(): Promise<Room[]> {
    return await this.service.getRooms();
  }
}
