import { Meta, Player, Stream, User } from "../domain/entities";
import idGenerator from "../infrastructure/utilities/idGenerator";

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
    this.stream = new Stream(
      options.stream.url,
      options.stream.infoHash,
      options.stream.fileIdx,
    );
    this.meta = new Meta(
      options.meta.id,
      options.meta.type,
      options.meta.name,
      options.meta.description,
      options.meta.year,
      options.meta.logo,
      options.meta.poster,
      options.meta.background,
    );
    this.player = new Player();
    this.users = [];
  }
}

export { Room, RoomOptions };
