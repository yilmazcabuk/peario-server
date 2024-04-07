import type { User } from "../../../domain/entities";

export default interface UpdateOwnershipDTO {
  client: User;
  payload: {
    userId: string;
  };
}
