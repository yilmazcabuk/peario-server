import Meta from "./meta.entity";
import Player from "./player.entity";
import Stream from "./stream.entity";

export default class Room {
  constructor(
    public owner: string,
    public users: Set<string>,
    public meta: Meta,
    public player: Player,
    public stream: Stream,
  ) {}
}
