import fs from "fs";
import https from "https";

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

const server = https
  .createServer(
    {
      cert: fs.readFileSync(PEM_CERT),
      key: fs.readFileSync(PEM_KEY),
    },
    (_, res) => {
      res.writeHead(200);
      res.end();
    },
  )
  .listen(PORT);

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
  if (!room) return client.sendEvent(new ErrorEvent("room"));

  wss.sendToRoomClients(room.id, new SyncEvent(room));
}

function messageRoom({ client, payload }: ClientMessage) {
  const room = roomManager.getClientRoom(client);
  if (!room) return client.sendEvent(new ErrorEvent("room"));

  if (payload.content) {
    const event = new MessageEvent(client, payload.content);
    if ((event.payload.date - client.cooldown) / 1000 < 3)
      return client.sendEvent(new ErrorEvent("cooldown"));

    wss.sendToRoomClients(room.id, event);
    client.resetCooldown();
  }
}

function updateRoomOwnership({ client, payload }: ClientUpdateOwnership) {
  const room = roomManager.getClientRoom(client);
  if (!room) return client.sendEvent(new ErrorEvent("room"));

  if (payload && payload.userId && room.owner === client.id) {
    const roomUser = room.users.find(
      ({ id, room_id }) => id === payload.userId && room_id === room.id,
    );

    if (!roomUser) return client.sendEvent(new ErrorEvent("user"));

    const updatedRoom = roomManager.updateOwner(room.id, roomUser);
    if (updatedRoom)
      wss.sendToRoomClients(updatedRoom.id, new SyncEvent(updatedRoom));
  }
}

function syncPlayer({ client, payload: player }: ClientSync) {
  const room = roomManager.getClientRoom(client);
  if (!room) return client.sendEvent(new ErrorEvent("room"));

  if (room.owner === client.id) {
    room.player = player;

    const clients = wss
      .getClientsByRoomId(room.id)
      .filter((c) => c.id !== client.id);
    wss.sendToClients(clients, new SyncEvent(room));
  } else {
    client.sendEvent(new SyncEvent(room));
  }
}

function heartbeat({ client }: ClientEvent) {
  client.last_active = new Date().getTime();
}

wss.events.on("user.update", updateUser);
wss.events.on("room.new", createRoom);
wss.events.on("room.join", joinRoom);
wss.events.on("room.message", messageRoom);
wss.events.on("room.updateOwnership", updateRoomOwnership);
wss.events.on("player.sync", syncPlayer);
wss.events.on("heartbeat", heartbeat);

setInterval(() => {
  roomManager.rooms = roomManager.rooms.map((room) => {
    const tmp_users = room.users;
    room.users = room.users.filter((user) =>
      wss.clients.find((client) => client.id === user.id),
    );

    if (JSON.stringify(room.users) !== JSON.stringify(tmp_users))
      wss.sendToRoomClients(room.id, new SyncEvent(room));
    return room;
  });
}, INTERVAL_ROOM_UPDATE);
