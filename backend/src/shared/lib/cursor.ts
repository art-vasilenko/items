import { ValidationError } from "../../errors/validation.error";

type AvailableCursorPayload = {
  type: "available";
  lastSeenId: number;
};

type SelectedCursorPayload = {
  type: "selected";
  lastSeenIndex: number;
};

type CursorPayload = AvailableCursorPayload | SelectedCursorPayload;

const encodeCursorPayload = (payload: CursorPayload) => {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
};

const decodeCursorPayload = (cursor: string): CursorPayload => {
  try {
    const rawValue = Buffer.from(cursor, "base64url").toString("utf8");
    const parsedValue = JSON.parse(rawValue) as Partial<CursorPayload>;

    if (parsedValue.type === "available" && typeof parsedValue.lastSeenId === "number") {
      return {
        type: "available",
        lastSeenId: parsedValue.lastSeenId,
      };
    }

    if (parsedValue.type === "selected" && typeof parsedValue.lastSeenIndex === "number") {
      return {
        type: "selected",
        lastSeenIndex: parsedValue.lastSeenIndex,
      };
    }
  } catch {
    throw new ValidationError("Cursor is malformed");
  }

  throw new ValidationError("Cursor is malformed");
};

export const encodeAvailableCursor = (lastSeenId: number) => {
  return encodeCursorPayload({
    type: "available",
    lastSeenId,
  });
};

export const encodeSelectedCursor = (lastSeenIndex: number) => {
  return encodeCursorPayload({
    type: "selected",
    lastSeenIndex,
  });
};

export const decodeAvailableCursor = (cursor: string) => {
  const payload = decodeCursorPayload(cursor);

  if (payload.type !== "available") {
    throw new ValidationError("Cursor does not belong to available items pagination");
  }

  return payload;
};

export const decodeSelectedCursor = (cursor: string) => {
  const payload = decodeCursorPayload(cursor);

  if (payload.type !== "selected") {
    throw new ValidationError("Cursor does not belong to selected items pagination");
  }

  return payload;
};
