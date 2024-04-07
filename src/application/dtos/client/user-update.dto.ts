import type { User } from "../../../domain/entities";

export default interface UserUpdateDTO {
  client: User;
  payload: {
    username: string;
  };
}
