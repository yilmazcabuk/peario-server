import type ServerEvent from "./server.event.interface";

export default class ErrorEvent implements ServerEvent {
  public type = "error";

  public payload: {
    type: string;
  };

  constructor(type: string) {
    this.payload = {
      type,
    };
  }
}
