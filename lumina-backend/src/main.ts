import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { winstonConfig } from './logger/winston.config';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonModule } from 'nest-winston';
import * as fs from 'fs';
import * as path from 'path';
import * as appInsights from 'applicationinsights';
import * as session from 'express-session';

async function bootstrap() {
  const logsDir = path.resolve(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

  if (process.env.APPINSIGHTS_CONNECTION_STRING) {
    try {
      appInsights
        .setup(process.env.APPINSIGHTS_CONNECTION_STRING)
        .setAutoCollectConsole(false)
        .setAutoCollectExceptions(false)
        .setAutoCollectDependencies(true)
        .setAutoDependencyCorrelation(true)
        .start();

      if (appInsights.defaultClient) {
        appInsights.defaultClient.trackTrace({
          message: 'manual test trace with props',
          properties: { context: 'TasksService', testKey: 'ok' },
        });
        appInsights.defaultClient.flush();
        console.log('manual test trace with props sent');
      }

      if (appInsights.defaultClient && appInsights.defaultClient.context) {
        appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] =
          'lumina-backend';
      }
    } catch (err) {
      console.warn('AppInsights init failed:', err);
    }
  }

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
  });

  let logger: any;
  try {
    logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  } catch {
    console.warn('Winston provider not found; using console as fallback.');
    logger = console;
  }

  process.on('uncaughtException', (err: any) => {
    try {
      logger.error('uncaughtException', {
        error: err instanceof Error ? err.message : String(err),
        stack: err?.stack,
      });
    } catch {
      console.error('uncaughtException', err);
    }
    if (appInsights.defaultClient) {
      try {
        appInsights.defaultClient.trackException({
          exception: err instanceof Error ? err : new Error(String(err)),
        });
        appInsights.defaultClient.flush();
      } catch {}
    }
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any) => {
    try {
      logger.error('unhandledRejection', {
        reason: reason instanceof Error ? reason.message : String(reason),
        stack: reason?.stack,
      });
    } catch {
      console.error('unhandledRejection', reason);
    }
    if (appInsights.defaultClient) {
      try {
        appInsights.defaultClient.trackException({
          exception: reason instanceof Error ? reason : new Error(String(reason)),
        });
        appInsights.defaultClient.flush();
      } catch {}
    }
  });

  app.use(cookieParser());

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'keyboard-cat',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24,
      },
    }),
  );

  app.use((req: any, _res, next) => {
    if (req.session && typeof req.session.touch !== 'function') {
      try {
        const SessionCtor = (session as any).Session;
        req.session = new SessionCtor(req, req.session);
      } catch (e) {}
    }
    next();
  });

  app.enableCors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);
  logger.log(`Backend running on http://localhost:${port}`);
}

bootstrap();
