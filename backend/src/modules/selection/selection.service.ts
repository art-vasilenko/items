import { ValidationError } from "../../errors/validation.error";
import { deduplicateIds } from "../../infrastructure/queue/deduplication";
import { itemsRepository } from "../items/items.repository";
import type { ReorderSelectedDto } from "./dto/reorder-selected.dto";
import type { SelectItemsDto } from "./dto/select-items.dto";
import type { UnselectItemsDto } from "./dto/unselect-items.dto";
import { selectionRepository } from "./selection.repository";

export class SelectionService {
  private getSelectedIdsResponse() {
    return {
      selectedIds: selectionRepository.getSelectedOrder(),
    };
  }

  private validateSelectedIds(ids: number[]) {
    const currentSelectedIds = selectionRepository.getSelectedIds();
    const invalidIds = deduplicateIds(ids).filter((id) => !currentSelectedIds.has(id));

    if (invalidIds.length > 0) {
      throw new ValidationError("Reorder payload contains IDs that are not selected", {
        invalidIds,
      });
    }
  }

  async selectItems(payload: SelectItemsDto) {
    const ids = deduplicateIds(payload.ids);
    const invalidIds = ids.filter((id) => !itemsRepository.isKnownId(id));

    if (invalidIds.length > 0) {
      throw new ValidationError("Cannot select unknown IDs", { invalidIds });
    }

    selectionRepository.addSelectedIds(ids);

    return this.getSelectedIdsResponse();
  }

  async unselectItems(payload: UnselectItemsDto) {
    const ids = deduplicateIds(payload.ids);

    selectionRepository.removeSelectedIds(ids);

    return this.getSelectedIdsResponse();
  }

  async reorderSelected(payload: ReorderSelectedDto) {
    if (Array.isArray(payload.orderedIds)) {
      return this.reorderSelectedSubset(payload.orderedIds);
    }

    this.validateSelectedIds([payload.activeId!, payload.overId!]);
    selectionRepository.moveSelectedId(payload.activeId!, payload.overId!);

    return this.getSelectedIdsResponse();
  }

  async applySelectionOperations(operations: Map<number, "select" | "unselect">) {
    const selectIds = [...operations.entries()]
      .filter(([, operation]) => operation === "select")
      .map(([id]) => id);
    const unselectIds = [...operations.entries()]
      .filter(([, operation]) => operation === "unselect")
      .map(([id]) => id);

    if (selectIds.length > 0) {
      await this.selectItems({ ids: selectIds });
    }

    if (unselectIds.length > 0) {
      await this.unselectItems({ ids: unselectIds });
    }

    return this.getSelectedIdsResponse();
  }

  private async reorderSelectedSubset(orderedIds: number[]) {
    const deduplicatedIds = deduplicateIds(orderedIds);
    this.validateSelectedIds(deduplicatedIds);
    selectionRepository.mergeSelectedSubset(deduplicatedIds);

    return this.getSelectedIdsResponse();
  }
}

export const selectionService = new SelectionService();
