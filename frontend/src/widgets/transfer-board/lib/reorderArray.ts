type ReorderableItem = number | { id: number };

const getItemId = (item: ReorderableItem) =>
  typeof item === "number" ? item : item.id;

export const reorderArray = <TItem extends ReorderableItem>(
  items: TItem[],
  activeId: number,
  overId: number,
) => {
  const activeIndex = items.findIndex((item) => getItemId(item) === activeId);
  const overIndex = items.findIndex((item) => getItemId(item) === overId);

  if (activeIndex < 0 || overIndex < 0) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(activeIndex, 1);
  nextItems.splice(overIndex, 0, movedItem);

  return nextItems;
};
