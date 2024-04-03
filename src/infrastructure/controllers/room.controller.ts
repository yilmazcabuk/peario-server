import { User } from "../../domain/entities";
import { Room, RoomOptions } from "../../shared";
import Client from "../../shared/client";

class RoomController {
  public rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  public create(client: Client, options: RoomOptions): Room {
    const room = new Room(options);
    room.owner = client.id;
    this.rooms.set(room.id, room);
    return room;
  }

  private getById(roomId: string): Room {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Room not found");
    return room;
  }

  public getClientRoom(client: Client): Room {
    return this.getById(client.roomId);
  }

  public join(client: Client, roomId: string): Room {
    const room = this.getById(roomId);
    client.roomId = room.id;
    room.users = [
      ...room.users.filter((user) => user.id !== client.id),
      new User(client.id, client.name, room.id),
    ];
    return room;
  }

  public updateUser(roomId: string, user: User): Room {
    const room = this.getById(roomId);
    room.users = room.users.map((roomUser) =>
      roomUser.id === user.id ? user : roomUser,
    );
    return room;
  }

  public updateOwner(roomId: string, user: User): Room {
    const room = this.getById(roomId);
    room.owner = user.id;
    return room;
  }
}

export default RoomController;
