import type { User } from "../../../domain/entities";
import type ServerEvent from "./server.event.interface";

export default class UserEvent implements ServerEvent {
  public type = "user";

  public payload: {
    user: User;
  };

  constructor(user: User) {
    this.payload = {
      user,
    };
  }
}
