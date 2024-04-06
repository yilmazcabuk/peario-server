import type { User } from "../../../domain/entities";

export default interface UpdateOwnershipDto {
  client: User;
  payload: {
    userId: string;
  };
}
