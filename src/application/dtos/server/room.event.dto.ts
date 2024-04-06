import type { Room } from "../../../domain/entities";
import type ServerEvent from "./server.event.dto";

export default class RoomEvent implements ServerEvent {
  public type = "room";

  public payload: Room;

  constructor(room: Room) {
    this.payload = room;
  }
}
