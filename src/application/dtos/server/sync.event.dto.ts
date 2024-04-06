import RoomEvent from "./room.event.dto";

export default class SyncEvent extends RoomEvent {
  public type = "sync";
}
