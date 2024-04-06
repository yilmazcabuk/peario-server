import type { Meta, Stream, User } from "../../../domain/entities";

export default interface NewRoomDto {
  client: User;
  payload: {
    meta: Meta;
    stream: Stream;
  };
}
