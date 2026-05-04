import { env, type LogLevel, type NodeEnv } from "@finance-manager/env/server";
import pino, {
  type DestinationStream,
  type Logger,
  stdSerializers,
} from "pino";

export interface CreateLoggerOptions {
  destination?: DestinationStream;
  level?: LogLevel;
  nodeEnv?: NodeEnv;
}

function shouldPrettyPrint(nodeEnv: NodeEnv, destination?: DestinationStream) {
  return nodeEnv === "development" && !destination;
}

export function createLogger(options: CreateLoggerOptions = {}): Logger {
  const level = options.level ?? env.LOG_LEVEL;
  const nodeEnv = options.nodeEnv ?? env.NODE_ENV;
  const destination = options.destination;

  return pino(
    {
      level,
      base: {
        service: "server",
      },
      redact: {
        paths: [
          "authorization",
          "cookie",
          "set-cookie",
          "headers.authorization",
          "headers.cookie",
          "headers.set-cookie",
          "req.headers.authorization",
          "req.headers.cookie",
          "req.headers.set-cookie",
        ],
        censor: "[redacted]",
      },
      serializers: {
        err: stdSerializers.err,
      },
    },
    shouldPrettyPrint(nodeEnv, destination)
      ? pino.transport({
          target: "pino-pretty",
          options: {
            colorize: true,
            singleLine: true,
            translateTime: "SYS:standard",
          },
        })
      : destination,
  );
}

export const logger = createLogger();

// Revisit pino-http if another Node-native service needs the same request logger.
