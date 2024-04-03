import Client from "../../../shared/client";
import ServerEvent from "./server.event.dto";

export default class MessageEvent implements ServerEvent {
  type = "message";

  payload: {
    user: string;
    content: string;
    date: number;
  };

  constructor(sender: Client, content: string) {
    this.payload = {
      user: sender.id,
      content: content.substring(0, 300),
      date: Date.now(),
    };
  }
}
