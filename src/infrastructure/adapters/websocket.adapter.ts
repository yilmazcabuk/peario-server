import { EventEmitter } from "events";
import https from "https";
import WebSocket from "ws";

import { ClientDto } from "../../application/dtos/client";
import { ReadyEvent, ServerEvent } from "../../application/dtos/server";
import UserService from "../../application/services/user.service";
import Client from "../../shared/client";
import { idGenerator } from "../utilities";

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

  public sendEvent(client: Client, { type, payload }: ServerEvent) {
    client.socket.send(JSON.stringify({ type, payload }));
  }

  private onMessage(client: Client, callback: (data: string) => void) {
    client.socket.on("message", callback);
  }

  private async initializeClient(client: Client, clientId: string) {
    const user = await this.userService.create(client);
    const event = new ReadyEvent(user);
    this.sendEvent(client, event);
    this.onMessage(client, (data: string) => this.handleEvents(client, data));
    this.clients.set(clientId, client);
  }

  private setupCleanupInterval(cleanInterval: number) {
    const cleanInactiveClients = (client: Client, clientId: string) => {
      const currentTime = Date.now();
      const isInactive = currentTime - client.lastActive >= cleanInterval;
      if (isInactive) this.clients.delete(clientId);
    };
    const cleanupCallback = () => this.clients.forEach(cleanInactiveClients);
    setInterval(cleanupCallback, cleanInterval);
  }

  private handleEvents(client: Client, data: string) {
    try {
      const { type, payload } = JSON.parse(data);
      this.emitClientEvent(type, { client, payload });
      console.log(client.name, type);
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  }

  private emitClientEvent(type: string, eventData: ClientDto) {
    this.events.emit(type, eventData);
  }

  public getClientsByRoomId(roomId: string) {
    const roomClients: Client[] = [];
    const filterClients = (client: Client) => {
      const isClientInRoom = client.roomId === roomId;
      if (isClientInRoom) roomClients.push(client);
    };
    this.clients.forEach(filterClients);
    return roomClients;
  }

  public sendToClients(clients: Client[], event: ServerEvent) {
    clients.forEach((client) => this.sendEvent(client, event));
  }

  public sendToRoomClients(roomId: string, event: ServerEvent) {
    const clients = this.getClientsByRoomId(roomId);
    this.sendToClients(clients, event);
  }
}

export default WebSocketAdapter;
