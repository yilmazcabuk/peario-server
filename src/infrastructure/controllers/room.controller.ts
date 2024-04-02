import { User } from "../../domain/entities";
import { Client, Room, RoomOptions } from "../../shared";

class RoomController {
  public rooms: Room[];

  constructor() {
    this.rooms = [];
  }

  public create(client: Client, options: RoomOptions): Room {
    const room = new Room(options);
    room.owner = client.id;
    this.rooms.push(room);
    return room;
  }

  private findRoomById(roomId: string): Room | undefined {
    return this.rooms.find((room) => room.id === roomId);
  }

  public getClientRoom(client: Client): Room | null {
    return this.rooms.find((room) => room.id === client.roomId) || null;
  }

  public join(client: Client, roomId: string): Room | null {
    const room = this.findRoomById(roomId);
    if (!room) return null;

    client.roomId = room.id;
    room.users = [
      ...room.users.filter((user) => user.id !== client.id),
      new User(client.id, client.name, room.id),
    ];

    return room;
  }

  public updateUser(roomId: string, user: User): Room | null {
    const room = this.findRoomById(roomId);
    if (!room) return null;

    room.users = room.users.map((roomUser) => {
      if (roomUser.id === user.id) roomUser = user;
      return roomUser;
    });

    return room;
  }

  public updateOwner(roomId: string, user: User): Room | null {
    const room = this.findRoomById(roomId);
    if (!room) return null;

    room.owner = user.id;

    return room;
  }
}

export default RoomController;
