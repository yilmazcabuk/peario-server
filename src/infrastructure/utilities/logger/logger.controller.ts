import type Logger from "./logger.interface";
import WinstonLogger from "./winston.logger";

export default class LoggerController {
  private logger: Logger;

  constructor() {
    this.logger = new WinstonLogger();
  }

  public emergency(message: string): void {
    this.logger.emergency(message);
  }

  public alert(message: string): void {
    this.logger.alert(message);
  }

  public critical(message: string): void {
    this.logger.critical(message);
  }

  public error(message: string): void {
    this.logger.error(message);
  }

  public warning(message: string): void {
    this.logger.warning(message);
  }

  public notice(message: string): void {
    this.logger.notice(message);
  }

  public informational(message: string): void {
    this.logger.informational(message);
  }

  public debug(message: string): void {
    this.logger.debug(message);
  }
}
