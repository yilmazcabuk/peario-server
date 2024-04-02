import { Client } from "../../../shared";

export default interface UpdateOwnershipDto {
  client: Client;

  payload: {
    userId: string;
  };
}
