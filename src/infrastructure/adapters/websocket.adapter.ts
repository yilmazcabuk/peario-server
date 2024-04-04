import { EventEmitter } from "events";
import https from "https";
import WebSocket from "ws";

import { ClientDto } from "../../application/dtos/client";
import { ReadyEvent, ServerEvent } from "../../application/dtos/server";
import { UserService } from "../../application/services";
import Client from "../../shared/client";
import { LoggerController } from "../utilities/logger";

class WebSocketAdapter {
  private readonly webSocketServer: WebSocket.Server;

  private readonly logger = new LoggerController();

  public events = new EventEmitter();

  public clients = new Map<string, Client>();

  public sockets = new Map<string, WebSocket>();

  constructor(
    server: https.Server,
    cleanInterval: number,
    private userController: UserService,
  ) {
    this.webSocketServer = new WebSocket.Server({ server });
    this.setupConnectionHandler();
    this.setupCleanupInterval(cleanInterval);
  }

  private setupConnectionHandler() {
    const connectionCallback = async (socket: WebSocket) => {
      const client = new Client();
      this.sockets.set(client.id, socket);
      await this.initializeClient(client);
      this.logger.notice(`Client connected: ${client.name} ${client.id}`);
    };
    this.webSocketServer.on("connection", connectionCallback);
  }

  private onMessage(client: Client, callback: (data: string) => void) {
    const socket = this.sockets.get(client.id);
    if (!socket) return;
    socket.on("message", callback);
  }

  public sendEvent(client: Client, { type, payload }: ServerEvent) {
    const socket = this.sockets.get(client.id);
    if (!socket) return;
    socket.send(JSON.stringify({ type, payload }));
  }

  private async initializeClient(client: Client) {
    const user = await this.userController.create(client);
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
      if (isInactive) {
        this.sockets.delete(clientId);
        this.clients.delete(clientId);
      }
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
