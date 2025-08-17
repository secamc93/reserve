import { Room } from '@/services/rooms/domain/Room';

export interface RoomRepository {
  getRooms(): Promise<Room[]>;
}
