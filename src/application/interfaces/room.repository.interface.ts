import type { Room } from "../../domain/entities";

export default interface RoomRepository {
  create(room: Room): Promise<Room>;

  get(id: string): Promise<Room>;

  update(id: string, room: Room): Promise<void>;

  delete(id: string): Promise<void>;

  addUser(roomId: string, userId: string): Promise<void>;

  removeUser(roomId: string, userId: string): Promise<void>;

  updateOwner(roomId: string, userId: string): Promise<void>;
}
