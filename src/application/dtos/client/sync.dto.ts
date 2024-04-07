import type { Player, User } from "../../../domain/entities";

export default interface SyncDTO {
  client: User;
  payload: Player;
}
