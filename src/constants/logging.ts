import winston from "winston"
import "winston-daily-rotate-file"

export let logger: winston.Logger

export function initLogging(level = "info") {
  const transport = new winston.transports.DailyRotateFile({
    filename: "logs/%DATE%.log", // logs/2025-04-22.log
    datePattern: "YYYY-MM-DD",
    zippedArchive: false,
    maxSize: "20m",
    maxFiles: "14d",
  })
  logger = winston.createLogger({
    level,
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level.toUpperCase()}: ${message}`
      }),
    ),
    transports: [new winston.transports.Console(), transport],
  })
}
