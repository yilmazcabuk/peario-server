import type { User } from "../../../domain/entities";
import type ServerEvent from "./server.event.dto";

export default class MessageEvent implements ServerEvent {
  public type = "message";

  public payload: {
    user: string;
    content: string;
    date: number;
  };

  constructor(sender: User, content: string) {
    this.payload = {
      user: sender.id,
      content: content.substring(0, 300),
      date: Date.now(),
    };
  }
}
