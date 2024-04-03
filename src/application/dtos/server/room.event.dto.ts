import { Room } from "../../../shared";
import ServerEvent from "./server.event.dto";

export default class RoomEvent implements ServerEvent {
  type = "room";

  payload: Room;

  constructor(room: Room) {
    this.payload = room;
  }
}
