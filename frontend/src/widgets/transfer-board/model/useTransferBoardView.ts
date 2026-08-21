import { useMemo } from "react";
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { useTransferBoard } from "./useTransferBoard";

export const useTransferBoardView = () => {
  const transferBoard = useTransferBoard();

  const selectedSortableIds = useMemo(
    () => transferBoard.selectedItems.map((item) => String(item.id)),
    [transferBoard.selectedItems],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const handleSelectedDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    void transferBoard.handleReorderSelected(Number(active.id), Number(over.id));
  };

  return {
    ...transferBoard,
    selectedSortableIds,
    sensors,
    handleSelectedDragEnd,
  };
};
