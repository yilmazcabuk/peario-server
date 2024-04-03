import { EventEmitter } from "events";
import https from "https";
import WebSocket from "ws";

import { ClientDto } from "../../application/dtos/client";
import { ReadyEvent, ServerEvent } from "../../application/dtos/server";
import UserService from "../../application/services/user.service";
import Client from "../../shared/client";
import LoggerController from "../utilities/logger";

class WebSocketAdapter {
  private webSocketServer: WebSocket.Server;

  public events = new EventEmitter();

  public clients = new Map<string, Client>();

  public logger = new LoggerController();

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
      await this.initializeClient(client);
      this.logger.notice(`Client connected: ${client.name} ${client.id}`);
    };
    this.webSocketServer.on("connection", connectionCallback);
  }

  public sendEvent(client: Client, { type, payload }: ServerEvent) {
    client.socket.send(JSON.stringify({ type, payload }));
  }

  private onMessage(client: Client, callback: (data: string) => void) {
    client.socket.on("message", callback);
  }

  private async initializeClient(client: Client) {
    const user = await this.userService.create(client);
    const event = new ReadyEvent(user);
    this.sendEvent(client, event);
    const onMessageCallback = (data: string) => this.handleEvents(client, data);
    this.onMessage(client, onMessageCallback);
    this.clients.set(client.id, client);
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
      this.logger.informational(`Client event: ${client.name} ${type}`);
    } catch (error) {
      this.logger.error(`Client event error: ${error}`);
    }
  }

  private emitClientEvent(type: string, eventData: ClientDto) {
    this.events.emit(type, eventData);
  }

  public getClientsByRoomId(roomId: string) {
    const roomClients: Client[] = [];
    const filterClients = (client: Client) => {
      if (client.roomId === roomId) roomClients.push(client);
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
