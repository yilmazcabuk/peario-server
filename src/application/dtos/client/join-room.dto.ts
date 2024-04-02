import { Client } from "../../../shared";

export default interface JoinRoomDto {
  client: Client;
  payload: {
    id: string;
  };
}
