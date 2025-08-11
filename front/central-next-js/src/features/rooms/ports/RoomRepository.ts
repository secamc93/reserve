import { Room } from '@/features/rooms/domain/Room';

export interface RoomRepository {
  getRooms(): Promise<Room[]>;
}
