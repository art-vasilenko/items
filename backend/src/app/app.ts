import cors from "cors";
import express from "express";

import { env } from "../config/env";
import { registerSwagger } from "../docs/swagger";
import { errorHandlerMiddleware } from "../infrastructure/http/middlewares/error-handler.middleware";
import { notFoundMiddleware } from "../infrastructure/http/middlewares/not-found.middleware";
import { requestIdMiddleware } from "../infrastructure/http/middlewares/request-id.middleware";
import { registerRoutes } from "./routes";

export const createApp = () => {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());
  app.use(requestIdMiddleware);

  registerSwagger(app);
  registerRoutes(app);

  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
};
