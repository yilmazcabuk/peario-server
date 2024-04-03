import winston, { createLogger, format } from "winston";

import Logger from "./logger.interface";

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

  emergency(message: string): void {
    this.logger.emerg(message);
  }

  alert(message: string): void {
    this.logger.alert(message);
  }

  critical(message: string): void {
    this.logger.crit(message);
  }

  error(message: string): void {
    this.logger.error(message);
  }

  warning(message: string): void {
    this.logger.warning(message);
  }

  notice(message: string): void {
    this.logger.notice(message);
  }

  informational(message: string): void {
    this.logger.info(message);
  }

  debug(message: string): void {
    this.logger.debug(message);
  }
}
