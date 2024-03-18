import { EventEmitter } from "events";
import https from "https";
import WebSocket from "ws";

import { Client, User } from "./shared";
import { ClientEvent } from "./shared/events/client";
import { ReadyEvent, ServerEvent } from "./shared/events/server";

class WS {
  private wss: WebSocket.Server;

  public events = new EventEmitter();

  public clients: Client[] = [];

  constructor(server: https.Server, cleanInterval: number) {
    this.wss = new WebSocket.Server({ server });
    this.wss.on("connection", (socket: WebSocket) => {
      const client = new Client(socket);
      client.sendEvent(new ReadyEvent(new User(client)));
      client.onMessage((data: string) => this.handleEvents(client, data));
      this.clients.push(client);
      console.log("New client:", client.id, client.name);
    });

    setInterval(() => {
      const currentTime = new Date().getTime();
      this.clients = this.clients.filter(
        (client) => currentTime - client.lastActive < cleanInterval,
      );
    }, cleanInterval);
  }

  private handleEvents(client: Client, data: string) {
    try {
      const { type, payload } = JSON.parse(data);
      this.events.emit(type, <ClientEvent>{ client, payload });
      console.log(client.name, type);
    } catch (e) {
      console.error("Error while parsing event");
    }
  }

  public getClientsByRoomId(roomId: string) {
    return this.clients.filter((client) => client.roomId === roomId);
  }

  public sendToClients(clients: Client[], event: ServerEvent) {
    clients.forEach((client) => client.sendEvent(event));
  }

  public sendToRoomClients(roomId: string, event: ServerEvent) {
    const clients = this.getClientsByRoomId(roomId);
    this.sendToClients(clients, event);
  }
}

export default WS;
