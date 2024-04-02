import { Meta, Stream } from "../../../domain/entities";
import { Client } from "../../../shared";

export default interface NewRoomDto {
  client: Client;
  payload: {
    meta: Meta;
    stream: Stream;
  };
}
