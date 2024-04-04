import Room from "../../domain/entities/room.entity";
import { idGenerator } from "../../infrastructure/utilities/generators";

export default interface RoomRepository {
  create(room: Room): Promise<Room>;

  get(id: string): Promise<Room>;

  update(id: string, room: Room): Promise<void>;

  delete(id: string): Promise<void>;

  addUser(roomId: string, userId: string): Promise<void>;

  removeUser(roomId: string, userId: string): Promise<void>;

  updateOwner(roomId: string, userId: string): Promise<void>;
}

class RoomRepositoryImpl implements RoomRepository {
  private rooms: Map<string, Room> = new Map();

  async create(room: Room): Promise<Room> {
    const id = idGenerator();
    this.rooms.set(id, room);
    return room;
  }

  async get(id: string): Promise<Room> {
    const room = this.rooms.get(id);
    if (!room) throw new Error("Room not found");
    return room;
  }

  async update(id: string, room: Room): Promise<void> {
    this.rooms.set(id, room);
  }

  async delete(id: string): Promise<void> {
    this.rooms.delete(id);
  }

  async addUser(roomId: string, userId: string): Promise<void> {
    const room = await this.get(roomId);
    room.users.add(userId);
  }

  async removeUser(roomId: string, userId: string): Promise<void> {
    const room = await this.get(roomId);
    room.users.delete(userId);
  }

  async updateOwner(roomId: string, userId: string): Promise<void> {
    const room = await this.get(roomId);
    room.owner = userId;
  }
}
