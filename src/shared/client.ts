import WebSocket from "ws";

import { idGenerator, nameGenerator } from "../infrastructure/utilities";

class Client {
  public id: string;

  public name: string;

  public roomId: string = "";

  public lastActive: number;

  public cooldown: number;

  public socket: WebSocket;

  constructor(socket: WebSocket) {
    this.id = idGenerator();
    this.name = nameGenerator(this.id);
    this.lastActive = Date.now();
    this.socket = socket;
    this.cooldown = Date.now();
  }

  resetCooldown() {
    this.cooldown = Date.now();
  }
}

export default Client;
