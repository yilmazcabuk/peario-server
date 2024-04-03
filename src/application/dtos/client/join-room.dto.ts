import Client from "../../../shared/client";

export default interface JoinRoomDto {
  client: Client;
  payload: {
    id: string;
  };
}
