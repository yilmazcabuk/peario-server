import type { User } from "../../../domain/entities";

export default interface MessageDto {
  client: User;
  payload: {
    content: string;
  };
}
