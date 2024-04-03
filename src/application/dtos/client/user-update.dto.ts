import Client from "../../../shared/client";

export default interface UserUpdateDto {
  client: Client;
  payload: {
    username: string;
  };
}
