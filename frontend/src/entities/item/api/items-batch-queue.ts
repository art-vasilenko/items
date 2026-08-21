import { flushItemsBatch } from "./items-api";
import { createDeferred, type Deferred } from "../../../shared/lib/createDeferred";

const SELECTION_FLUSH_INTERVAL_MS = 1_000;
const ADD_ITEMS_FLUSH_INTERVAL_MS = 10_000;

type SelectionOperation = "select" | "unselect";

type BatchCommand =
  | { type: "add-items"; ids: number[] }
  | { type: "select-items"; ids: number[] }
  | { type: "unselect-items"; ids: number[] }
  | { type: "reorder-selected"; orderedIds: number[] };

class ItemsBatchQueue {
  private readonly addItemIds = new Set<number>();
  private readonly selectionOperations = new Map<number, SelectionOperation>();
  private pendingReorderIds: number[] | null = null;

  private readonly addDeferreds: Deferred<void>[] = [];
  private readonly selectionDeferreds: Deferred<void>[] = [];

  private addTimer: ReturnType<typeof setTimeout> | null = null;
  private selectionTimer: ReturnType<typeof setTimeout> | null = null;

  private activeAddFlush: Promise<void> | null = null;
  private activeSelectionFlush: Promise<void> | null = null;

  enqueueAddItem(id: number) {
    const deferred = createDeferred<void>();

    this.addItemIds.add(id);
    this.addDeferreds.push(deferred);
    this.planAddFlush();

    return deferred.promise;
  }

  enqueueSelection(id: number, operation: SelectionOperation) {
    const deferred = createDeferred<void>();

    this.selectionOperations.set(id, operation);
    this.selectionDeferreds.push(deferred);
    this.planSelectionFlush();

    return deferred.promise;
  }

  enqueueReorder(orderedIds: number[]) {
    const deferred = createDeferred<void>();

    this.pendingReorderIds = [...orderedIds];
    this.selectionDeferreds.push(deferred);
    this.planSelectionFlush();

    return deferred.promise;
  }

  private resolveDeferreds(deferreds: Deferred<void>[]) {
    deferreds.forEach((deferred) => deferred.resolve());
  }

  private rejectDeferreds(deferreds: Deferred<void>[], error: unknown) {
    deferreds.forEach((deferred) => deferred.reject(error));
  }

  private buildSelectionCommands(
    operations: Map<number, SelectionOperation>,
    reorderedIds: number[] | null,
  ): BatchCommand[] {
    const commands: BatchCommand[] = [];
    const selectedIds: number[] = [];
    const unselectedIds: number[] = [];

    operations.forEach((operation, id) => {
      if (operation === "select") {
        selectedIds.push(id);
        return;
      }

      unselectedIds.push(id);
    });

    if (selectedIds.length > 0) {
      commands.push({ type: "select-items", ids: selectedIds });
    }

    if (unselectedIds.length > 0) {
      commands.push({ type: "unselect-items", ids: unselectedIds });
    }

    if (reorderedIds !== null) {
      commands.push({ type: "reorder-selected", orderedIds: reorderedIds });
    }

    return commands;
  }

  private planAddFlush() {
    if (this.addTimer) {
      return;
    }

    this.addTimer = setTimeout(() => {
      this.addTimer = null;
      void this.flushAddItems();
    }, ADD_ITEMS_FLUSH_INTERVAL_MS);
  }

  private planSelectionFlush() {
    if (this.selectionTimer) {
      return;
    }

    this.selectionTimer = setTimeout(() => {
      this.selectionTimer = null;
      void this.flushSelection();
    }, SELECTION_FLUSH_INTERVAL_MS);
  }

  private async flushAddItems() {
    if (this.addTimer) {
      clearTimeout(this.addTimer);
      this.addTimer = null;
    }

    if (this.activeAddFlush) {
      return this.activeAddFlush;
    }

    const ids = [...this.addItemIds];
    const deferreds = this.addDeferreds.splice(0, this.addDeferreds.length);

    if (ids.length === 0) {
      this.resolveDeferreds(deferreds);
      return;
    }

    this.addItemIds.clear();

    this.activeAddFlush = (async () => {
      try {
        await flushItemsBatch([
          {
            type: "add-items",
            ids,
          },
        ]);
        this.resolveDeferreds(deferreds);
      } catch (error) {
        this.rejectDeferreds(deferreds, error);
      } finally {
        this.activeAddFlush = null;

        if (this.addItemIds.size > 0) {
          this.planAddFlush();
        }
      }
    })();

    return this.activeAddFlush;
  }

  private async flushSelection() {
    if (this.selectionTimer) {
      clearTimeout(this.selectionTimer);
      this.selectionTimer = null;
    }

    if (this.activeSelectionFlush) {
      return this.activeSelectionFlush;
    }

    const deferreds = this.selectionDeferreds.splice(0, this.selectionDeferreds.length);
    const selectionOperations = new Map(this.selectionOperations);
    const pendingReorderIds = this.pendingReorderIds ? [...this.pendingReorderIds] : null;

    if (selectionOperations.size === 0 && pendingReorderIds === null) {
      this.resolveDeferreds(deferreds);
      return;
    }

    this.selectionOperations.clear();
    this.pendingReorderIds = null;
    const commands = this.buildSelectionCommands(selectionOperations, pendingReorderIds);

    this.activeSelectionFlush = (async () => {
      try {
        await flushItemsBatch(commands);
        this.resolveDeferreds(deferreds);
      } catch (error) {
        this.rejectDeferreds(deferreds, error);
      } finally {
        this.activeSelectionFlush = null;

        if (this.selectionOperations.size > 0 || this.pendingReorderIds !== null) {
          this.planSelectionFlush();
        }
      }
    })();

    return this.activeSelectionFlush;
  }
}

export const itemsBatchQueue = new ItemsBatchQueue();
