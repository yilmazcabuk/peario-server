import type { User } from "../../../domain/entities";

export default interface JoinRoomDTO {
  client: User;
  payload: {
    id: string;
  };
}
