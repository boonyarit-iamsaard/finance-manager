import { auth } from "@finance-manager/auth";
import { env } from "@finance-manager/env/server";
import type { Context } from "hono";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import type { Logger } from "pino";

import { logger as baseLogger } from "./lib/logger";
import {
  getRequestId,
  getRequestLogger,
  requestLoggerMiddleware,
} from "./middleware/request-logger";

export interface AppVariables {
  logger: Logger;
  requestId: string;
}

export type AppContext = Context<{ Variables: AppVariables }>;

export interface CreateAppOptions {
  logger?: Logger;
}

export function createApp(options: CreateAppOptions = {}) {
  const logger = options.logger ?? baseLogger;
  const app = new Hono<{ Variables: AppVariables }>();

  app.use(requestLoggerMiddleware(logger));
  app.use(
    "/*",
    cors({
      origin: env.CORS_ORIGIN,
      allowMethods: ["GET", "POST", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      credentials: true,
    }),
  );

  app.onError((error, context) => {
    const status = error instanceof HTTPException ? error.status : 500;
    const requestLogger = getRequestLogger(context);
    const requestId = getRequestId(context);
    const logPayload = {
      event: "request.error",
      request_id: requestId,
      status,
      err: error,
    };

    if (status >= 500) {
      requestLogger.error(logPayload, "request failed");
    } else {
      requestLogger.warn(logPayload, "request failed");
    }

    if (error instanceof HTTPException) {
      return error.getResponse();
    }

    return context.json({ error: "internal server error" }, 500);
  });

  app.on(["POST", "GET"], "/api/auth/*", (context) =>
    auth.handler(context.req.raw),
  );

  app.get("/status", (context) => {
    return context.json({ status: "ok" });
  });

  app.get("/", (context) => {
    return context.text("OK");
  });

  return app;
}
