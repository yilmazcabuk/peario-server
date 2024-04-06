import {
  idGenerator,
  nameGenerator,
} from "../infrastructure/utilities/generators";

class Client {
  public id: string;

  public name: string;

  public roomId: string = "";

  public lastActive: number;

  public cooldown: number;

  constructor() {
    this.id = idGenerator();
    this.name = nameGenerator(this.id);
    this.lastActive = Date.now();
    this.cooldown = Date.now();
  }

  public resetCooldown() {
    this.cooldown = Date.now();
  }
}

export default Client;
