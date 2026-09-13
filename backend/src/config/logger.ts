import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

export const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
            let log = `[${timestamp}] ${level}: ${message}`;
            if (Object.keys(meta).length > 0) {
              log += ` ${JSON.stringify(meta)}`;
            }
            if (stack) {
              log += `\n${stack}`;
            }
            return log;
          })
        )
  ),
  defaultMeta: { service: 'triora-backend' },
  transports: [new winston.transports.Console()]
});

export default logger;
