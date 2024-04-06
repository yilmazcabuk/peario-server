import type { RoomRepository } from "../../application/interfaces";
import type { Room } from "../../domain/entities";
import { idGenerator } from "../../infrastructure/utilities/generators";

export default class RoomRepositoryImpl implements RoomRepository {
  private rooms: Map<string, Room> = new Map();

  public async create(room: Room): Promise<Room> {
    const id = idGenerator();
    this.rooms.set(id, room);
    return room;
  }

  public async get(id: string): Promise<Room> {
    const room = this.rooms.get(id);
    if (!room) throw new Error("Room not found");
    return room;
  }

  public async update(id: string, room: Room): Promise<void> {
    this.rooms.set(id, room);
  }

  public async delete(id: string): Promise<void> {
    this.rooms.delete(id);
  }

  public async addUser(roomId: string, userId: string): Promise<void> {
    const room = await this.get(roomId);
    room.users.push(userId);
  }

  public async removeUser(roomId: string, userId: string): Promise<void> {
    const room = await this.get(roomId);
    room.users.delete(userId);
  }

  public async updateOwner(roomId: string, userId: string): Promise<void> {
    const room = await this.get(roomId);
    room.owner = userId;
  }
}
