import { User } from "../../../domain/entities";
import ServerEvent from "./server.event.dto";

export default class ReadyEvent implements ServerEvent {
  type = "ready";

  payload: {
    user: User;
  };

  constructor(user: User) {
    this.payload = {
      user,
    };
  }
}
