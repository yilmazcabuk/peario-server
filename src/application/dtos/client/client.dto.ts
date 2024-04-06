import type { User } from "../../../domain/entities";

export default interface ClientDto {
  client: User;
  payload: object;
}
