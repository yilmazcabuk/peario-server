import { User } from "../../domain/entities";
import { LoggerController } from "../../infrastructure/utilities/logger";
import { Room, RoomOptions } from "../../shared";

export default class RoomService {
  public rooms: Map<string, Room>;

  private logger = new LoggerController();

  constructor() {
    this.rooms = new Map();
  }

  create(owner: string, options: RoomOptions): Room {
    const room = new Room(options);
    room.owner = owner;
    this.rooms.set(room.id, room);
    return room;
  }

  get(roomId: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) this.logger.error(`Room not found: ${roomId}`);
    return <Room>room;
  }

  join(id: string, name: string, roomId: string): Room {
    const room = this.get(roomId);
    room.users = [
      ...room.users.filter((user) => user.id !== id),
      new User(id, name, room.id),
    ];
    return room;
  }

  updateUser(roomId: string, user: User): Room {
    const room = this.get(roomId);
    room.users = room.users.map((roomUser) =>
      roomUser.id === user.id ? user : roomUser,
    );
    return room;
  }

  updateOwner(roomId: string, user: User): Room {
    const room = this.get(roomId);
    room.owner = user.id;
    return room;
  }
}
