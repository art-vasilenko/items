import type { Request, Response } from "express";

import { asyncHandler } from "../../infrastructure/http/utils/async-handler";
import { mutationScheduler } from "../../infrastructure/queue/server-schedulers";
import { sendResponse } from "../../infrastructure/http/utils/send-response";
import { reorderSelectedSchema } from "./dto/reorder-selected.dto";
import { selectItemsSchema } from "./dto/select-items.dto";
import { unselectItemsSchema } from "./dto/unselect-items.dto";

export class SelectionController {
  select = asyncHandler(async (request: Request, response: Response) => {
    const payload = selectItemsSchema.parse(request.body);
    const result = await mutationScheduler.enqueueSelection(payload.ids, "select");

    sendResponse(response, result);
  });

  unselect = asyncHandler(async (request: Request, response: Response) => {
    const payload = unselectItemsSchema.parse(request.body);
    const result = await mutationScheduler.enqueueSelection(payload.ids, "unselect");

    sendResponse(response, result);
  });

  reorder = asyncHandler(async (request: Request, response: Response) => {
    const payload = reorderSelectedSchema.parse(request.body);
    const result = await mutationScheduler.enqueueReorder(
      Array.isArray(payload.orderedIds)
        ? { orderedIds: payload.orderedIds }
        : { activeId: payload.activeId!, overId: payload.overId! },
    );

    sendResponse(response, result);
  });
}

export const selectionController = new SelectionController();
