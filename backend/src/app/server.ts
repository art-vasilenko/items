import { createApp } from "./app";
import { env } from "../config/env";

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`Backend server is running on port ${env.port}`);
});

let isShuttingDown = false;

const shutdown = (exitCode: number) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  const forceExitTimer = setTimeout(() => {
    process.exit(exitCode);
  }, 10_000);

  forceExitTimer.unref();

  server.close(() => {
    clearTimeout(forceExitTimer);
    process.exit(exitCode);
  });
};

process.on("uncaughtException", () => {
  shutdown(1);
});

process.on("unhandledRejection", () => {
  shutdown(1);
});
