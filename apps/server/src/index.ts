import { env } from "@finance-manager/env/server";

import { createApp } from "./app";
import { logger } from "./lib/logger";

let fatalHandlersRegistered = false;

function registerFatalHandlers() {
  if (fatalHandlersRegistered) {
    return;
  }

  process.on("uncaughtException", (error) => {
    logger.fatal(
      {
        event: "process.uncaught_exception",
        err: error,
      },
      "uncaught exception",
    );
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));

    logger.fatal(
      {
        event: "process.unhandled_rejection",
        err: error,
      },
      "unhandled rejection",
    );
    process.exit(1);
  });

  fatalHandlersRegistered = true;
}

registerFatalHandlers();

const app = createApp();

logger.info(
  {
    event: "server.started",
    node_env: env.NODE_ENV,
    port: env.PORT,
  },
  "server started",
);

export default {
  port: env.PORT,
  fetch: app.fetch,
};
