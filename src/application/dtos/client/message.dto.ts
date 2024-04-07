import type { User } from "../../../domain/entities";

export default interface MessageDTO {
  client: User;
  payload: {
    content: string;
  };
}
