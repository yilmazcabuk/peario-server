import type { Player } from "../../../domain/entities";
import type Client from "../../../shared/client";

export default interface SyncDto {
  client: Client;
  payload: Player;
}
