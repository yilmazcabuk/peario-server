import type { Meta, Stream, User } from "../../../domain/entities";

export default interface NewRoomDTO {
  client: User;
  payload: {
    meta: Meta;
    stream: Stream;
  };
}
