import type { Meta, Stream, User } from "../../domain/entities";
import { Player, Room } from "../../domain/entities";
import { idGenerator } from "../../infrastructure/utilities/generators";
import { LoggerController } from "../../infrastructure/utilities/logger";
import type UserService from "./user.service";

export default class RoomService {
  public rooms: Map<string, Room>;

  private logger = new LoggerController();

  constructor(private userService: UserService) {
    this.rooms = new Map();
  }

  public async create(owner: User, meta: Meta, stream: Stream): Promise<Room> {
    const id = idGenerator();
    const user = await this.userService.get(owner.id);
    const users = [user];
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

  public async addUser(
    id: string,
    name: string,
    roomId: string,
  ): Promise<Room> {
    const room = this.get(roomId);
    const newUser = await this.userService.create(id, name, roomId);
    room.users = [...room.users.filter((user) => user.id !== id), newUser];
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
