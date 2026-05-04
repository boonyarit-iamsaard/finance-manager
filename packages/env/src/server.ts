import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const LOG_LEVELS = [
  "trace",
  "debug",
  "info",
  "warn",
  "error",
  "fatal",
] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

export const NODE_ENVS = ["development", "production", "test"] as const;
export type NodeEnv = (typeof NODE_ENVS)[number];

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    LOG_LEVEL: z.enum(LOG_LEVELS).default("info"),
    NODE_ENV: z.enum(NODE_ENVS).default("development"),
    PORT: z.coerce.number().default(4000),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
