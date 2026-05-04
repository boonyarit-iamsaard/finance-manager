import { Writable } from "node:stream";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface LogRecord {
  level: number;
  msg: string;
  event?: string;
  request_id?: string;
  path?: string;
  status?: number;
  duration_ms?: number;
  headers?: Record<string, string>;
  authorization?: string;
  cookie?: string;
  "set-cookie"?: string;
}

const SERVER_ENV = {
  BETTER_AUTH_SECRET: "aR817loRgXzsy1pwlCkWkETeiovbipcd",
  BETTER_AUTH_URL: "http://localhost:4000",
  CORS_ORIGIN: "http://localhost:3000",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/finance_manager",
  LOG_LEVEL: "debug",
  NODE_ENV: "test",
  PORT: "4000",
} as const;

function createLogDestination() {
  const chunks: string[] = [];

  const destination = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk.toString());
      callback();
    },
  });

  return {
    destination,
    getRecords() {
      return chunks
        .join("")
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as LogRecord);
    },
  };
}

async function importServerModules() {
  vi.resetModules();
  Object.entries(SERVER_ENV).forEach(([key, value]) => {
    process.env[key] = value;
  });

  const [{ createApp }, { createLogger }] = await Promise.all([
    import("./app"),
    import("./lib/logger"),
  ]);

  return { createApp, createLogger };
}

describe("server app", () => {
  beforeEach(() => {
    Object.entries(SERVER_ENV).forEach(([key, value]) => {
      process.env[key] = value;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns status ok with a generated request id", async () => {
    const { createApp, createLogger } = await importServerModules();
    const logDestination = createLogDestination();
    const logger = createLogger({
      destination: logDestination.destination,
      level: "debug",
      nodeEnv: "test",
    });
    const app = createApp({ logger });

    const response = await app.request("http://localhost/status");

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
    const requestId = response.headers.get("x-request-id");
    expect(requestId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const requestLog = logDestination
      .getRecords()
      .find((record) => record.event === "request.completed");

    expect(requestLog).toMatchObject({
      level: 20,
      path: "/status",
      request_id: requestId,
      status: 200,
    });
    expect(requestLog?.duration_ms).toBeTypeOf("number");
  });

  it("accepts an incoming request id header", async () => {
    const { createApp, createLogger } = await importServerModules();
    const logDestination = createLogDestination();
    const logger = createLogger({
      destination: logDestination.destination,
      level: "debug",
      nodeEnv: "test",
    });
    const app = createApp({ logger });

    const response = await app.request("http://localhost/status", {
      headers: {
        "x-request-id": "client-123",
      },
    });

    expect(response.headers.get("x-request-id")).toBe("client-123");

    const requestLog = logDestination
      .getRecords()
      .find((record) => record.event === "request.completed");

    expect(requestLog?.request_id).toBe("client-123");
  });

  it("maps request log levels by status code", async () => {
    const { createApp, createLogger } = await importServerModules();
    const logDestination = createLogDestination();
    const logger = createLogger({
      destination: logDestination.destination,
      level: "debug",
      nodeEnv: "test",
    });
    const app = createApp({ logger });

    app.get("/boom", () => {
      throw new Error("boom");
    });

    const notFoundResponse = await app.request("http://localhost/missing");
    const errorResponse = await app.request("http://localhost/boom");

    expect(notFoundResponse.status).toBe(404);
    expect(errorResponse.status).toBe(500);

    const records = logDestination.getRecords();
    const notFoundLog = records.find(
      (record) =>
        record.event === "request.completed" && record.path === "/missing",
    );
    const errorLog = records.find(
      (record) =>
        record.event === "request.completed" && record.path === "/boom",
    );

    expect(notFoundLog?.level).toBe(40);
    expect(errorLog?.level).toBe(50);
  });

  it("redacts sensitive fields", async () => {
    const { createLogger } = await importServerModules();
    const logDestination = createLogDestination();
    const logger = createLogger({
      destination: logDestination.destination,
      level: "debug",
      nodeEnv: "test",
    });

    logger.info({
      authorization: "Bearer secret",
      cookie: "session=secret",
      headers: {
        authorization: "Bearer nested",
      },
      "set-cookie": "session=another-secret",
    });

    const [record] = logDestination.getRecords();

    expect(record).toMatchObject({
      authorization: "[redacted]",
      cookie: "[redacted]",
      headers: {
        authorization: "[redacted]",
      },
      "set-cookie": "[redacted]",
    });
  });
});
