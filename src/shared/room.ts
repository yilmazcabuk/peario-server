import idGenerator from "../utilities/idGenerator";
import Meta from "./meta";
import Player from "./player";
import Stream from "./stream";
import User from "./user";

interface RoomOptions {
  meta: Meta;
  stream: Stream;
}

class Room {
  public id: string;

  public stream: Stream;

  public meta: Meta;

  public users: User[];

  public player: Player;

  public owner?: string;

  constructor(options: RoomOptions) {
    this.id = idGenerator();
    this.stream = new Stream(options.stream);
    this.meta = new Meta(options.meta);
    this.player = new Player();
    this.users = [];
  }
}

export { Room, RoomOptions };
