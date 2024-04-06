import type { User } from "../../../domain/entities";

export default interface JoinRoomDto {
  client: User;
  payload: {
    id: string;
  };
}
