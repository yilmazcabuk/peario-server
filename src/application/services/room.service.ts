import type { Meta, Stream } from "../../domain/entities";
import { Player, Room, User } from "../../domain/entities";
import { idGenerator } from "../../infrastructure/utilities/generators";
import { LoggerController } from "../../infrastructure/utilities/logger";

export default class RoomService {
  public rooms: Map<string, Room>;

  private logger = new LoggerController();

  constructor() {
    this.rooms = new Map();
  }

  public create(owner: User, meta: Meta, stream: Stream): Room {
    const id = idGenerator();
    const users = [new User(owner.id, owner.name, owner.roomId)];
    const player = new Player();
    const room = new Room(id, owner.id, users, meta, player, stream);
    this.rooms.set(room.id, room);
    return room;
  }

  public get(roomId: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) this.logger.error(`Room not found: ${roomId}`);
    return <Room>room;
  }

  public addUser(id: string, name: string, roomId: string): Room {
    const room = this.get(roomId);
    room.users = [
      ...room.users.filter((user) => user.id !== id),
      new User(id, name, room.id),
    ];
    return room;
  }

  public updateUser(roomId: string, user: User): Room {
    const room = this.get(roomId);
    room.users = room.users.map((roomUser) =>
      roomUser.id === user.id ? user : roomUser,
    );
    return room;
  }

  public updateOwner(roomId: string, user: User): Room {
    const room = this.get(roomId);
    room.owner = user.id;
    return room;
  }
}
