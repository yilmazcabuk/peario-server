import winston, { createLogger, format } from "winston";

import type Logger from "./logger.interface";

export default class WinstonLogger implements Logger {
  private logger: winston.Logger;

  constructor() {
    const { combine, timestamp, printf, colorize, align } = format;
    this.logger = createLogger({
      levels: winston.config.syslog.levels,
      format: combine(
        colorize({ all: true }),
        timestamp({
          format: "DD-MM-YYYY hh:mm:ss A",
        }),
        align(),
        printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
      ),
      transports: [new winston.transports.Console()],
    });
  }

  public emergency(message: string): void {
    this.logger.emerg(message);
  }

  public alert(message: string): void {
    this.logger.alert(message);
  }

  public critical(message: string): void {
    this.logger.crit(message);
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
    this.logger.info(message);
  }

  public debug(message: string): void {
    this.logger.debug(message);
  }
}
