import { randomUUID } from "node:crypto";

import type { Logger } from "pino";

import type { AppContext } from "../app";
import { logger as baseLogger } from "../lib/logger";

const REQUEST_ID_HEADER = "x-request-id";
const REQUEST_ID_KEY = "requestId";
const REQUEST_LOGGER_KEY = "logger";
const QUIET_PATHS = new Set(["/", "/status"]);
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,128}$/;

type RequestLogLevel = "debug" | "info" | "warn" | "error";

function getRequestPath(context: AppContext) {
  return new URL(context.req.url).pathname;
}

function getIncomingRequestId(context: AppContext) {
  const requestId = context.req.header(REQUEST_ID_HEADER)?.trim();

  if (requestId && REQUEST_ID_PATTERN.test(requestId)) {
    return requestId;
  }

  return randomUUID();
}

function getRequestLogLevel(status: number, pathname: string): RequestLogLevel {
  if (status >= 500) {
    return "error";
  }

  if (QUIET_PATHS.has(pathname)) {
    return "debug";
  }

  if (status >= 400) {
    return "warn";
  }

  return "info";
}

export function setRequestId(context: AppContext, requestId: string) {
  context.set(REQUEST_ID_KEY, requestId);
}

export function getRequestId(context: AppContext) {
  return context.get(REQUEST_ID_KEY);
}

export function setRequestLogger(context: AppContext, logger: Logger) {
  context.set(REQUEST_LOGGER_KEY, logger);
}

export function getRequestLogger(context?: AppContext) {
  if (!context) {
    return baseLogger;
  }

  return context.get(REQUEST_LOGGER_KEY) ?? baseLogger;
}

export function requestLoggerMiddleware(logger: Logger = baseLogger) {
  return async (context: AppContext, next: () => Promise<void>) => {
    const requestId = getIncomingRequestId(context);
    const pathname = getRequestPath(context);
    const requestLogger = logger.child({ request_id: requestId });
    const startedAt = performance.now();

    setRequestId(context, requestId);
    setRequestLogger(context, requestLogger);
    context.header(REQUEST_ID_HEADER, requestId);

    await next();

    const durationMs = Math.round((performance.now() - startedAt) * 100) / 100;
    const status = context.res.status;
    const level = getRequestLogLevel(status, pathname);

    requestLogger[level](
      {
        event: "request.completed",
        method: context.req.method,
        path: pathname,
        status,
        duration_ms: durationMs,
      },
      "request completed",
    );
  };
}
