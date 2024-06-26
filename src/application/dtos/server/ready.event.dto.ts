import type { User } from "../../../domain/entities";
import type ServerEvent from "./server.event.interface";

export default class ReadyEvent implements ServerEvent {
  public type = "ready";

  public payload: {
    user: User;
  };

  constructor(user: User) {
    this.payload = {
      user,
    };
  }
}
