import { Router } from "express";

import { itemsBatchController } from "./items-batch.controller";

export const batchRouter = Router();

batchRouter.post("/flush", itemsBatchController.flush);
