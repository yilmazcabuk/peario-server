import ServerEvent from "./server.event.dto";

export default class ErrorEvent implements ServerEvent {
  type = "error";

  payload: {
    type: string;
  };

  constructor(type: string) {
    this.payload = {
      type,
    };
  }
}
