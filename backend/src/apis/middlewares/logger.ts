import { Request, Response, NextFunction } from "express";
import { createLogger, transports, format } from "winston";

export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [new transports.Console()]
});


export function requestLogger(req: Request, res: Response, next: NextFunction) {
  logger.info(`${req.method} ${req.url}`);
  next();
}
