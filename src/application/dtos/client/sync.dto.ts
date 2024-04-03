import { Player } from "../../../domain/entities";
import Client from "../../../shared/client";

export default interface SyncDto {
  client: Client;
  payload: Player;
}
