import { Client } from "../../../shared";

export default interface MessageDto {
  client: Client;
  payload: {
    content: string;
  };
}
