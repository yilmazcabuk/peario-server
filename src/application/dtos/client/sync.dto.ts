import type { Player, User } from "../../../domain/entities";

export default interface SyncDto {
  client: User;
  payload: Player;
}
