export const resolveAvailableItemTone = (itemId: number) => {
  if (itemId > 1_000_000) {
    return "manual" as const;
  }

  return itemId % 3 === 0 ? ("accent" as const) : ("neutral" as const);
};

export const resolveSelectedItemTone = (itemId: number) => {
  if (itemId > 1_000_000) {
    return "manual" as const;
  }

  return "selected" as const;
};
