import type Meta from "./meta.entity";
import type Player from "./player.entity";
import type Stream from "./stream.entity";
import type User from "./user.entity";

export default class Room {
  constructor(
    public id: string,
    public owner: string,
    public users: Array<User>,
    public meta: Meta,
    public player: Player,
    public stream: Stream,
  ) {}
}
