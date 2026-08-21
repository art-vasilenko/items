import type { Express } from "express";

import { healthRouter } from "../modules/health/health.routes";
import { batchRouter } from "../modules/items-batch/items-batch.routes";
import { itemsRouter } from "../modules/items/items.routes";
import { selectionRouter } from "../modules/selection/selection.routes";

export const registerRoutes = (app: Express) => {
  const apiV1Prefix = "/api/v1";

  app.use(`${apiV1Prefix}/health`, healthRouter);
  app.use(`${apiV1Prefix}/items`, itemsRouter);
  app.use(`${apiV1Prefix}/selection`, selectionRouter);
  app.use(`${apiV1Prefix}/batch`, batchRouter);
};
