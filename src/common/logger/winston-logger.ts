import * as winston from 'winston';
import 'winston-daily-rotate-file';

// Configure daily rotation file transport
const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '7d', // Keep logs for 7 days
  level: 'info', // Define the log level
});

// Create a custom logger using winston
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.simple()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
    transport,
  ],
});
