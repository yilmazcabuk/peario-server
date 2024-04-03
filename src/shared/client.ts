import WebSocket from "ws";

import { ServerEvent } from "../application/dtos/server";
import idGenerator from "../infrastructure/utilities/id-generator.utility";

class Client {
  public id: string;

  public name: string;

  public roomId: string = "";

  public lastActive: number;

  public cooldown: number;

  private socket: WebSocket;

  constructor(socket: WebSocket) {
    this.id = idGenerator();
    this.name = `Guest${this.id.substring(0, 4)}`;
    this.lastActive = Date.now();
    this.socket = socket;
    this.cooldown = Date.now();
  }

  onMessage(callback: (data: string) => void) {
    this.socket.on("message", callback);
  }

  sendEvent({ type, payload }: ServerEvent) {
    this.socket.send(JSON.stringify({ type, payload }));
  }

  resetCooldown() {
    this.cooldown = Date.now();
  }
}

export default Client;
