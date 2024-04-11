import type {
  ClientDTO,
  JoinRoomDTO,
  MessageDTO,
  NewRoomDTO,
  SyncDTO,
  UpdateOwnershipDTO,
  UserUpdateDTO,
} from "./application/dtos/client";
import {
  ErrorEvent,
  MessageEvent,
  RoomEvent,
  SyncEvent,
  UserEvent,
} from "./application/dtos/server";
import { RoomService, UserService } from "./application/services";
import { HttpsAdapter, WebSocketAdapter } from "./infrastructure/adapters";
import { ConfigRepositoryImpl, ConfigService } from "./infrastructure/config";
import { UserRepositoryImpl } from "./persistence/repositories";

const configRepository = new ConfigRepositoryImpl();
const configService = new ConfigService(configRepository);
const userRepository = new UserRepositoryImpl();
const userService = new UserService(userRepository);
const roomService = new RoomService(userService);

const { INTERVAL_CLIENT_CHECK, INTERVAL_ROOM_UPDATE } = configService.intervals;

function createServer(interval: number) {
  const httpsAdapter = new HttpsAdapter(configService.server);
  return new WebSocketAdapter(httpsAdapter, interval, userService);
}

const webSocketAdapter = createServer(INTERVAL_CLIENT_CHECK);

webSocketAdapter.events.on(
  "user.update",
  async ({ client, payload }: UserUpdateDTO) => {
    const { username } = payload;
    if (username.length === 0) return;

    client.name = username.slice(0, 25);
    const { id, name, roomId } = client;
    const user = await userService.create(id, name, roomId);
    webSocketAdapter.sendEvent(client, new UserEvent(user));

    const room = roomService.get(client.roomId);
    if (!room) return;

    roomService.updateUser(room.id, user);
    webSocketAdapter.sendToRoomClients(room.id, new SyncEvent(room));
  },
);

webSocketAdapter.events.on(
  "room.create",
  async ({ client, payload }: NewRoomDTO) => {
    const room = await roomService.create(client, payload.meta, payload.stream);
    webSocketAdapter.sendEvent(client, new RoomEvent(room));
  },
);

webSocketAdapter.events.on(
  "room.join",
  async ({ client, payload }: JoinRoomDTO) => {
    const { id } = payload;
    client.roomId = id;
    const room = await roomService.addUser(client, client.roomId);

    if (!room) {
      webSocketAdapter.sendEvent(client, new ErrorEvent("room"));
      return;
    }

    webSocketAdapter.sendToRoomClients(room.id, new SyncEvent(room));
  },
);

webSocketAdapter.events.on(
  "room.message",
  ({ client, payload }: MessageDTO) => {
    const room = roomService.get(client.roomId);

    if (!room) {
      webSocketAdapter.sendEvent(client, new ErrorEvent("room"));
      return;
    }

    if (!payload.content) return;

    const event = new MessageEvent(client, payload.content);
    const cooldownSeconds = (event.payload.date - client.cooldown) / 1000;

    if (cooldownSeconds < 3) {
      webSocketAdapter.sendEvent(client, new ErrorEvent("cooldown"));
      return;
    }

    webSocketAdapter.sendToRoomClients(room.id, event);
    client.cooldown = Date.now();
  },
);

webSocketAdapter.events.on(
  "room.updateOwnership",
  ({ client, payload }: UpdateOwnershipDTO) => {
    const room = roomService.get(client.roomId);

    if (!room) {
      webSocketAdapter.sendEvent(client, new ErrorEvent("room"));
      return;
    }

    const { userId } = payload || {};

    if (!userId || room.owner !== client.id) return;

    const roomUser = room.users.find(
      ({ id, roomId }) => id === userId && roomId === room.id,
    );

    if (!roomUser) {
      webSocketAdapter.sendEvent(client, new ErrorEvent("user"));
      return;
    }

    const updatedRoom = roomService.updateOwner(room.id, roomUser);

    if (!updatedRoom) return;

    webSocketAdapter.sendToRoomClients(
      updatedRoom.id,
      new SyncEvent(updatedRoom),
    );
  },
);

webSocketAdapter.events.on("player.sync", ({ client, payload }: SyncDTO) => {
  const room = roomService.get(client.roomId);

  if (!room) {
    webSocketAdapter.sendEvent(client, new ErrorEvent("room"));
    return;
  }

  const isRoomOwner = room.owner === client.id;

  if (!isRoomOwner) {
    webSocketAdapter.sendEvent(client, new SyncEvent(room));
    return;
  }

  room.player = payload.player;

  const otherClients = webSocketAdapter
    .getClientsByRoomId(room.id)
    .filter((user) => user.id !== client.id);

  webSocketAdapter.sendToClients(otherClients, new SyncEvent(room));
});

webSocketAdapter.events.on("heartbeat", ({ client }: ClientDTO) => {
  client.lastActive = Date.now();
});

function arraysEqual<T>(firstArray: T[], secondArray: T[]) {
  return (
    firstArray.length === secondArray.length &&
    firstArray.every((value, index) => value === secondArray[index])
  );
}

function updateRooms() {
  roomService.rooms.forEach((room) => {
    const previousUsers = [...room.users];
    const updatedUsers = room.users.filter((user) =>
      webSocketAdapter.clients.has(user.id),
    );

    if (arraysEqual(updatedUsers, previousUsers)) return;

    const updatedRoom = { ...room, users: updatedUsers };
    webSocketAdapter.sendToRoomClients(room.id, new SyncEvent(updatedRoom));
  });
}

setInterval(updateRooms, INTERVAL_ROOM_UPDATE);
