import type Client from "../../../shared/client";

export default interface UpdateOwnershipDto {
  client: Client;
  payload: {
    userId: string;
  };
}
