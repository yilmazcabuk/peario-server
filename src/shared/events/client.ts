import { Meta, Player, Stream } from "../../domain/entities";
import { Client } from "..";

type ClientEvent<T = object> = {
  client: Client;
  payload: T;
};

interface ClientUserUpdate extends ClientEvent<{ username: string }> {}

interface ClientNewRoom extends ClientEvent<{ meta: Meta; stream: Stream }> {}

interface ClientJoinRoom extends ClientEvent<{ id: string }> {}

interface ClientMessage extends ClientEvent<{ content: string }> {}

interface ClientUpdateOwnership extends ClientEvent<{ userId: string }> {}

interface ClientSync extends ClientEvent<Player> {}

export {
  ClientEvent,
  ClientJoinRoom,
  ClientMessage,
  ClientNewRoom,
  ClientSync,
  ClientUpdateOwnership,
  ClientUserUpdate,
};
