import type Client from "../../../shared/client";

export default interface ClientDto {
  client: Client;
  payload: object;
}
