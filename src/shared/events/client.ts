import { Client, Player } from "..";
import Meta from "../meta";
import Stream from "../stream";

type ClientEvent = {
  client: Client;
  payload: object;
};

interface ClientUserUpdate extends ClientEvent {
  payload: {
    username: string;
  };
}

interface ClientNewRoom extends ClientEvent {
  payload: {
    meta: Meta;
    stream: Stream;
  };
}

interface CientJoinRoom extends ClientEvent {
  payload: {
    id: string;
  };
}

interface ClientMessage extends ClientEvent {
  payload: {
    content: string;
  };
}

interface ClientUpdateOwnership extends ClientEvent {
  payload: {
    userId: string;
  };
}

interface ClientSync extends ClientEvent {
  payload: Player;
}

export {
  CientJoinRoom,
  ClientEvent,
  ClientMessage,
  ClientNewRoom,
  ClientSync,
  ClientUpdateOwnership,
  ClientUserUpdate,
};
