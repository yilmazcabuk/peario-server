import { Player } from "../../../domain/entities";
import { Client } from "../../../shared";

export default interface SyncDto {
  client: Client;
  payload: Player;
}
