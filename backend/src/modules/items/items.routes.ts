import { Router } from "express";

import { itemsController } from "./items.controller";

export const itemsRouter = Router();

itemsRouter.get("/available", itemsController.getAvailable);
itemsRouter.get("/selected", itemsController.getSelected);
itemsRouter.post("/custom", itemsController.addCustom);
