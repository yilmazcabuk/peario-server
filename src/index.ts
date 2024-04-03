import { readFileSync } from "fs";
import { createServer } from "https";

import {
  ClientDto,
  JoinRoomDto,
  MessageDto,
  NewRoomDto,
  SyncDto,
  UpdateOwnershipDto,
  UserUpdateDto,
} from "./application/dtos/client";
import {
  ErrorEvent,
  MessageEvent,
  RoomEvent,
  SyncEvent,
  UserEvent,
} from "./application/dtos/server";
import UserService from "./application/services/user.service";
import WebSocketAdapter from "./infrastructure/adapters/websocket.adapter";
import {
  INTERVAL_CLIENT_CHECK,
  INTERVAL_ROOM_UPDATE,
  PEM_CERT,
  PEM_KEY,
  PORT,
} from "./infrastructure/config/config";
import RoomController from "./infrastructure/controllers/room.controller";
import UserRepositoryImpl from "./infrastructure/repositories/user.repository";

const serverOptions = {
  cert: readFileSync(PEM_CERT),
  key: readFileSync(PEM_KEY),
};

const server = createServer(serverOptions, (_, res) => {
  res.writeHead(200);
  res.end();
}).listen(PORT);

console.log(`Listening on port ${PORT}`);

const userRepository = new UserRepositoryImpl();
const userService = new UserService(userRepository);

const wss = new WebSocketAdapter(server, INTERVAL_CLIENT_CHECK, userService);
const roomManager = new RoomController();

async function updateUser({ client, payload }: UserUpdateDto) {
  const { username } = payload;

  if (username.length > 0) {
    client.name = username.slice(0, 25);

    const user = await userService.create(client);
    client.sendEvent(new UserEvent(user));

    const room = roomManager.getClientRoom(client);
    if (room) {
      roomManager.updateUser(room.id, user);
      wss.sendToRoomClients(room.id, new SyncEvent(room));
    }
  }
}

function createRoom({ client, payload }: NewRoomDto) {
  const room = roomManager.create(client, payload);

  client.sendEvent(new RoomEvent(room));
}

function joinRoom({ client, payload }: JoinRoomDto) {
  const { id } = payload;
  const room = roomManager.join(client, id);

  if (!room) {
    client.sendEvent(new ErrorEvent("room"));
    return;
  }

  wss.sendToRoomClients(room.id, new SyncEvent(room));
}

function messageRoom({ client, payload }: MessageDto) {
  const room = roomManager.getClientRoom(client);

  if (!room) {
    client.sendEvent(new ErrorEvent("room"));
    return;
  }

  if (payload.content) {
    const event = new MessageEvent(client, payload.content);
    const cooldownSeconds = (event.payload.date - client.cooldown) / 1000;

    if (cooldownSeconds < 3) {
      client.sendEvent(new ErrorEvent("cooldown"));
      return;
    }

    wss.sendToRoomClients(room.id, event);
    client.resetCooldown();
  }
}

function updateRoomOwnership({ client, payload }: UpdateOwnershipDto) {
  const room = roomManager.getClientRoom(client);

  if (!room) {
    client.sendEvent(new ErrorEvent("room"));
    return;
  }

  const { userId } = payload || {};

  if (userId && room.owner === client.id) {
    const roomUser = room.users.find(
      ({ id, roomId }) => id === userId && roomId === room.id,
    );

    if (!roomUser) {
      client.sendEvent(new ErrorEvent("user"));
      return;
    }

    const updatedRoom = roomManager.updateOwner(room.id, roomUser);

    if (updatedRoom) {
      wss.sendToRoomClients(updatedRoom.id, new SyncEvent(updatedRoom));
    }
  }
}

function syncPlayer({ client, payload: player }: SyncDto) {
  const room = roomManager.getClientRoom(client);

  if (!room) {
    client.sendEvent(new ErrorEvent("room"));
    return;
  }

  const isRoomOwner = room.owner === client.id;

  if (isRoomOwner) {
    room.player = player;
    const otherClients = wss
      .getClientsByRoomId(room.id)
      .filter((user) => user.id !== client.id);
    wss.sendToClients(otherClients, new SyncEvent(room));
  } else {
    client.sendEvent(new SyncEvent(room));
  }
}

function heartbeat({ client }: ClientDto) {
  client.lastActive = Date.now();
}

wss.events.on("user.update", updateUser);
wss.events.on("room.new", createRoom);
wss.events.on("room.join", joinRoom);
wss.events.on("room.message", messageRoom);
wss.events.on("room.updateOwnership", updateRoomOwnership);
wss.events.on("player.sync", syncPlayer);
wss.events.on("heartbeat", heartbeat);

function arraysEqual<T>(firstArray: T[], secondArray: T[]) {
  return (
    firstArray.length === secondArray.length &&
    firstArray.every((value, index) => value === secondArray[index])
  );
}

function updateRooms() {
  roomManager.rooms.forEach((room) => {
    const previousUsers = [...room.users];
    const updatedUsers = room.users.filter((user) => wss.clients.has(user.id));

    if (!arraysEqual(updatedUsers, previousUsers)) {
      const updatedRoom = { ...room, users: updatedUsers };
      wss.sendToRoomClients(room.id, new SyncEvent(updatedRoom));
    }
  });
}

setInterval(updateRooms, INTERVAL_ROOM_UPDATE);
