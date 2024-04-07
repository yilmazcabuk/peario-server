import type { User } from "../../../domain/entities";

export default interface ClientDTO {
  client: User;
  payload: object;
}
