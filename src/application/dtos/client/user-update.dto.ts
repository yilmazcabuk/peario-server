import type { User } from "../../../domain/entities";

export default interface UserUpdateDto {
  client: User;
  payload: {
    username: string;
  };
}
