import { EventEmitter } from "events";
import https from "https";
import WebSocket from "ws";

import ClientDto from "../../application/dtos/client/client.dto";
import { ReadyEvent, ServerEvent } from "../../application/dtos/server";
import UserService from "../../application/services/user.service";
import Client from "../../shared/client";
import idGenerator from "../utilities/id-generator.utility";

class WebSocketAdapter {
  private webSocketServer: WebSocket.Server;

  public events = new EventEmitter();

  public clients = new Map<string, Client>();

  constructor(
    server: https.Server,
    cleanInterval: number,
    private userService: UserService,
  ) {
    this.webSocketServer = new WebSocket.Server({ server });
    this.setupConnectionHandler();
    this.setupCleanupInterval(cleanInterval);
  }

  private setupConnectionHandler() {
    const connectionCallback = async (socket: WebSocket) => {
      const client = new Client(socket);
      const clientId = idGenerator();
      await this.initializeClient(client, clientId);
      console.log("New client:", client.id, client.name);
    };
    this.webSocketServer.on("connection", connectionCallback);
  }

  private async initializeClient(client: Client, clientId: string) {
    const user = await this.userService.create(client);
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

  private emitClientEvent(type: string, eventData: ClientDto) {
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
