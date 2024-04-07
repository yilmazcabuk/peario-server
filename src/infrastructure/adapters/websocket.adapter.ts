import { EventEmitter } from "events";
import type https from "https";
import WebSocket from "ws";

import type { ClientDTO } from "../../application/dtos/client";
import type { ServerEvent } from "../../application/dtos/server";
import { ReadyEvent } from "../../application/dtos/server";
import type { UserService } from "../../application/services";
import type { User } from "../../domain/entities";
import { LoggerController } from "../utilities/logger";

export default class WebSocketAdapter {
  public events = new EventEmitter();

  public clients = new Map<string, User>();

  public sockets = new Map<string, WebSocket>();

  private readonly webSocketServer: WebSocket.Server;

  private readonly logger = new LoggerController();

  constructor(
    server: https.Server,
    cleanInterval: number,
    private userController: UserService,
  ) {
    this.webSocketServer = new WebSocket.Server({ server });
    this.setupConnectionHandler();
    this.setupCleanupInterval(cleanInterval);
  }

  public getClientsByRoomId(roomId: string) {
    const roomClients: User[] = [];
    const filterClients = (client: User) => {
      if (client.roomId === roomId) roomClients.push(client);
    };
    this.clients.forEach(filterClients);
    return roomClients;
  }

  public sendEvent(client: User, { type, payload }: ServerEvent) {
    const socket = this.sockets.get(client.id);
    if (!socket) return;
    socket.send(JSON.stringify({ type, payload }));
  }

  public sendToClients(clients: User[], event: ServerEvent) {
    clients.forEach((client) => this.sendEvent(client, event));
  }

  public sendToRoomClients(roomId: string, event: ServerEvent) {
    const clients = this.getClientsByRoomId(roomId);
    this.sendToClients(clients, event);
  }

  private setupConnectionHandler() {
    const connectionCallback = async (socket: WebSocket) => {
      const client = await this.userController.create();
      this.sockets.set(client.id, socket);
      await this.initializeClient(client);
      this.logger.notice(`Client connected: ${client.name} ${client.id}`);
    };
    this.webSocketServer.on("connection", connectionCallback);
  }

  private onMessage(client: User, callback: (data: string) => void) {
    const socket = this.sockets.get(client.id);
    if (!socket) return;
    socket.on("message", callback);
  }

  private async initializeClient(client: User) {
    const { id, name, roomId } = client;
    const user = await this.userController.create(id, name, roomId);
    const event = new ReadyEvent(user);
    this.sendEvent(client, event);
    const onMessageCallback = (data: string) => this.handleEvents(client, data);
    this.onMessage(client, onMessageCallback);
    this.clients.set(client.id, client);
  }

  private setupCleanupInterval(cleanInterval: number) {
    const cleanInactiveClients = (client: User, clientId: string) => {
      const currentTime = Date.now();
      const isInactive = currentTime - client.lastActive >= cleanInterval;
      if (!isInactive) return;
      this.sockets.delete(clientId);
      this.clients.delete(clientId);
    };
    const cleanupCallback = () => this.clients.forEach(cleanInactiveClients);
    setInterval(cleanupCallback, cleanInterval);
  }

  private handleEvents(client: User, data: string) {
    try {
      const { type, payload } = JSON.parse(data);
      this.emitClientEvent(type, { client, payload });
      this.logger.informational(`Client event: ${client.name} ${type}`);
    } catch (error) {
      this.logger.error(`Client event error: ${error}`);
    }
  }

  private emitClientEvent(type: string, eventData: ClientDTO) {
    this.events.emit(type, eventData);
  }
}
