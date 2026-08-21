import type { Request, Response } from "express";

import { asyncHandler } from "../../infrastructure/http/utils/async-handler";
import { mutationScheduler, readRequestScheduler } from "../../infrastructure/queue/server-schedulers";
import { sendResponse } from "../../infrastructure/http/utils/send-response";
import { addCustomItemsSchema } from "./dto/add-custom-items.dto";
import { getAvailableItemsSchema } from "./dto/get-available-items.dto";
import { getSelectedItemsSchema } from "./dto/get-selected-items.dto";
import { itemsService } from "./items.service";

export class ItemsController {
  getAvailable = asyncHandler(async (request: Request, response: Response) => {
    const query = getAvailableItemsSchema.parse(request.query);
    const result = await readRequestScheduler.schedule(
      `available:${JSON.stringify(query)}`,
      () => itemsService.getAvailableItems(query),
    );

    sendResponse(response, result.items, {
      limit: result.limit,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  });

  getSelected = asyncHandler(async (request: Request, response: Response) => {
    const query = getSelectedItemsSchema.parse(request.query);
    const result = await readRequestScheduler.schedule(
      `selected:${JSON.stringify(query)}`,
      () => itemsService.getSelectedItems(query),
    );

    sendResponse(response, result.items, {
      limit: result.limit,
      hasMore: result.hasMore,
      nextCursor: result.nextCursor,
    });
  });

  addCustom = asyncHandler(async (request: Request, response: Response) => {
    const payload = addCustomItemsSchema.parse(request.body);
    const result = await mutationScheduler.enqueueAddItems(payload.ids);

    sendResponse(response, result);
  });
}

export const itemsController = new ItemsController();
