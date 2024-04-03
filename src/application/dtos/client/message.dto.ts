import Client from "../../../shared/client";

export default interface MessageDto {
  client: Client;
  payload: {
    content: string;
  };
}
