import { itemsService } from "../../modules/items/items.service";
import { selectionService } from "../../modules/selection/selection.service";
import { MutationScheduler } from "./mutation-scheduler";
import { readRequestScheduler } from "./read-request-scheduler";

export const mutationScheduler = new MutationScheduler({
  addItems: (ids) => itemsService.addCustomItems({ ids }),
  applySelectionOperations: (operations) => selectionService.applySelectionOperations(operations),
  applyReorder: (payload) => selectionService.reorderSelected(payload),
});

export { readRequestScheduler };
