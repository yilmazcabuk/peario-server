import { v4 as uuidv4 } from "uuid";
import WebSocket from "ws";

import { ServerEvent } from "./events/server";

class Client {
  public id: string;

  public name: string;

  public roomId: string = "";

  public lastActive: number;

  public cooldown: number;

  private socket: WebSocket;

  constructor(socket: WebSocket) {
    this.id = uuidv4();
    this.name = `Guest${this.id.substring(0, 4)}`;
    this.lastActive = new Date().getTime();
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
