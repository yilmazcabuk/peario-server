import { User } from "../../../domain/entities";
import ServerEvent from "./server.event.dto";

export default class UserEvent implements ServerEvent {
  type = "user";

  payload: {
    user: User;
  };

  constructor(user: User) {
    this.payload = {
      user,
    };
  }
}
