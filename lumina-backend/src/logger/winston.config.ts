import * as winston from 'winston';
import { format } from 'winston';
import { AppInsightsTransport } from '../logs/app-insights.transport';

const isProd = process.env.NODE_ENV === 'production';

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const ctx = meta && (meta as any).context ? ` (${(meta as any).context})` : '';
        const rest = Object.keys(meta || {}).length ? ` ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] ${level}: ${message}${ctx}${rest}`;
      }),
    ),
  }),
  new winston.transports.File({
    filename: 'logs/app.log',
    format: winston.format.combine(format.timestamp(), format.json()),
  }),
];

if (process.env.APPINSIGHTS_CONNECTION_STRING) {
  transports.push(new AppInsightsTransport({}));
}

export const winstonConfig = {
  level: isProd ? 'warn' : 'debug',
  transports,
};
