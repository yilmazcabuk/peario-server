import { EventEmitter } from "events";
import https from "https";
import WebSocket from "ws";

import { User } from "../entities";
import { Client } from "../shared";
import { ClientEvent } from "../shared/events/client";
import { ReadyEvent, ServerEvent } from "../shared/events/server";
import idGenerator from "../utilities/idGenerator";

class WebSocketAdapter {
  private webSocketServer: WebSocket.Server;

  public events = new EventEmitter();

  public clients = new Map<string, Client>();

  constructor(server: https.Server, cleanInterval: number) {
    this.webSocketServer = new WebSocket.Server({ server });
    this.setupConnectionHandler();
    this.setupCleanupInterval(cleanInterval);
  }

  private setupConnectionHandler() {
    this.webSocketServer.on("connection", (socket: WebSocket) => {
      const client = new Client(socket);
      const clientId = idGenerator();
      this.initializeClient(client, clientId);
      console.log("New client:", client.id, client.name);
    });
  }

  private initializeClient(client: Client, clientId: string) {
    const user = new User(client.id, client.name, client.roomId);
    const event = new ReadyEvent(user);

    client.sendEvent(event);
    client.onMessage((data: string) => this.handleEvents(client, data));
    this.clients.set(clientId, client);
  }

  private setupCleanupInterval(cleanInterval: number) {
    setInterval(() => {
      const currentTime = Date.now();
      this.clients.forEach((client, clientId) => {
        if (currentTime - client.lastActive >= cleanInterval)
          this.clients.delete(clientId);
      });
    }, cleanInterval);
  }

  private handleEvents(client: Client, data: string) {
    try {
      const { type, payload } = JSON.parse(data);
      this.emitClientEvent(type, { client, payload });
      console.log(client.name, type);
    } catch (e) {
      console.error("Error while parsing event");
    }
  }

  private emitClientEvent(type: string, eventData: ClientEvent) {
    this.events.emit(type, eventData);
  }

  public getClientsByRoomId(roomId: string) {
    const roomClients: Client[] = [];
    this.clients.forEach((client) => {
      if (client.roomId === roomId) {
        roomClients.push(client);
      }
    });
    return roomClients;
  }

  public sendToClients(clients: Client[], event: ServerEvent) {
    clients.forEach((client) => client.sendEvent(event));
  }

  public sendToRoomClients(roomId: string, event: ServerEvent) {
    const clients = this.getClientsByRoomId(roomId);
    this.sendToClients(clients, event);
  }
}

export default WebSocketAdapter;
