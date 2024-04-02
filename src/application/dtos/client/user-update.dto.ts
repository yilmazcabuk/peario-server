import { Client } from "../../../shared";

export default interface UserUpdateDto {
  client: Client;

  payload: {
    username: string;
  };
}
