import type { User } from "../../../domain/entities";

export default interface DTO<T = object> {
  client: User;
  payload: T;
}
