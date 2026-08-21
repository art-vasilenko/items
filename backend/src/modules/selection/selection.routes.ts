import { Router } from "express";

import { selectionController } from "./selection.controller";

export const selectionRouter = Router();

selectionRouter.post("/select", selectionController.select);
selectionRouter.post("/unselect", selectionController.unselect);
selectionRouter.post("/reorder", selectionController.reorder);
