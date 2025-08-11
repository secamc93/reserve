import { Room } from '@/features/rooms/domain/Room';
import { RoomRepository } from '@/features/rooms/ports/RoomRepository';

export class GetRoomsUseCase {
  constructor(private repository: RoomRepository) {}

  async execute(): Promise<Room[]> {
    try {
      return await this.repository.getRooms();
    } catch (error) {
      console.error('GetRoomsUseCase: Error:', error);
      return [];
    }
  }
}
