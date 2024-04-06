import type { Meta, Stream } from "../../../domain/entities";
import type Client from "../../../shared/client";

export default interface NewRoomDto {
  client: Client;
  payload: {
    meta: Meta;
    stream: Stream;
  };
}
