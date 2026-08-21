import { Router } from "express";

import { healthController } from "./health.controller";

export const healthRouter = Router();

healthRouter.get("/", (request, response) => {
  healthController.getStatus(request, response);
});
