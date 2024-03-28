import { readFileSync } from "fs";
import { createServer } from "https";

import {
  INTERVAL_CLIENT_CHECK,
  INTERVAL_ROOM_UPDATE,
  PEM_CERT,
  PEM_KEY,
  PORT,
} from "./common/config";
import RoomManager from "./room";
import { User } from "./shared";
import {
  ClientEvent,
  ClientJoinRoom,
  ClientMessage,
  ClientNewRoom,
  ClientSync,
  ClientUpdateOwnership,
  ClientUserUpdate,
} from "./shared/events/client";
import {
  ErrorEvent,
  MessageEvent,
  RoomEvent,
  SyncEvent,
  UserEvent,
} from "./shared/events/server";
import WS from "./ws";

const server = createServer(
  {
    cert: readFileSync(PEM_CERT),
    key: readFileSync(PEM_KEY),
  },
  (_, res) => {
    res.writeHead(200);
    res.end();
  },
).listen(PORT);

console.log(`Listening on port ${PORT}`);

const wss = new WS(server, INTERVAL_CLIENT_CHECK);
const roomManager = new RoomManager();

function updateUser({ client, payload }: ClientUserUpdate) {
  const { username } = payload;

  if (username.length > 0) {
    client.name = username.slice(0, 25);

    const user = new User(client);
    client.sendEvent(new UserEvent(user));

    const room = roomManager.getClientRoom(client);
    if (room) {
      roomManager.updateUser(room.id, user);
      wss.sendToRoomClients(room.id, new SyncEvent(room));
    }
  }
}

function createRoom({ client, payload }: ClientNewRoom) {
  const room = roomManager.create(client, payload);

  client.sendEvent(new RoomEvent(room));
}

function joinRoom({ client, payload }: ClientJoinRoom) {
  const { id } = payload;
  const room = roomManager.join(client, id);

  if (!room) {
    client.sendEvent(new ErrorEvent("room"));
    return;
  }

  wss.sendToRoomClients(room.id, new SyncEvent(room));
}

function messageRoom({ client, payload }: ClientMessage) {
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

function updateRoomOwnership({ client, payload }: ClientUpdateOwnership) {
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

function syncPlayer({ client, payload: player }: ClientSync) {
  const room = roomManager.getClientRoom(client);

  if (!room) {
    client.sendEvent(new ErrorEvent("room"));
    return;
  }

  if (room.owner === client.id) {
    room.player = player;
    const otherClients = wss
      .getClientsByRoomId(room.id)
      .filter((c) => c.id !== client.id);
    wss.sendToClients(otherClients, new SyncEvent(room));
  } else {
    client.sendEvent(new SyncEvent(room));
  }
}

function heartbeat({ client }: ClientEvent) {
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

    const updatedUsers = room.users.filter((user) =>
      wss.clients.some((client) => client.id === user.id),
    );

    if (!arraysEqual(updatedUsers, previousUsers)) {
      const updatedRoom = { ...room, users: updatedUsers };
      wss.sendToRoomClients(room.id, new SyncEvent(updatedRoom));
    }
  });
}

setInterval(updateRooms, INTERVAL_ROOM_UPDATE);
