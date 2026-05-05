import type {
  DirectRelationshipQueueUndoChangeState,
  StudioState,
} from "../types";

export type NativeRelationshipEntity =
  DirectRelationshipQueueUndoChangeState["entity"];

export type NativeRelationshipQueueHistory = NonNullable<
  StudioState["directEditor"]["relationshipQueueHistory"]
>;

export type NativeRelationshipQueueUndoChange =
  NativeRelationshipQueueHistory["undoChanges"][number];

export type NativeRelationshipQueueItem = {
  key: string;
  fieldKey: string;
  label: string;
  preview: string;
  target: string;
  sourceValue: string;
  targetValue: string;
  button: HTMLElement;
};

export type NativeRelationshipQueueApplyResult = {
  target: string;
  undoChanges: NativeRelationshipQueueUndoChange[];
};

export function getNativeRelationshipFixTarget(button: HTMLElement) {
  const fixKind = button.dataset.fixKind || "";
  const entity: NativeRelationshipEntity | "" = fixKind.startsWith("state-")
    ? "state"
    : fixKind.startsWith("burg-")
      ? "burg"
      : fixKind.startsWith("province-")
        ? "province"
        : "";
  const id = Number(button.dataset[`${entity}Id` as keyof DOMStringMap]);
  return { fixKind, entity, id };
}

export type DirectRelationshipEntity = NativeRelationshipEntity;
export type DirectRelationshipQueueHistory = NativeRelationshipQueueHistory;
export type DirectRelationshipQueueUndoChange =
  NativeRelationshipQueueUndoChange;
export type DirectRelationshipQueueItem = NativeRelationshipQueueItem;
export type DirectRelationshipQueueApplyResult =
  NativeRelationshipQueueApplyResult;

export const getDirectRelationshipFixTarget = getNativeRelationshipFixTarget;
export const getDirectRelationshipFixField = getNativeRelationshipFixField;
export const getDirectRelationshipButtonFieldValue =
  getNativeRelationshipButtonFieldValue;
export const getDirectRelationshipCurrentFieldValue =
  getNativeRelationshipCurrentFieldValue;
export const createDirectRelationshipDatasetPayload =
  createNativeRelationshipDatasetPayload;
export const applyDirectRelationshipQueuedItems =
  applyNativeRelationshipQueuedItems;
export const createDirectRelationshipUndoButton =
  createNativeRelationshipUndoButton;
export const reviewDirectRelationshipQueue = reviewNativeRelationshipQueue;
export const getDirectRelationshipQueueImpactSummary =
  getNativeRelationshipQueueImpactSummary;

export function normalizeRelationshipQueueValue(value: string) {
  return value.trim().replace(/^#/, "");
}

export function getNativeRelationshipFixField(fixKind: string) {
  return fixKind.includes("culture")
    ? "culture"
    : fixKind.includes("capital")
      ? "capital"
      : fixKind.includes("burg")
        ? "burg"
        : "state";
}

export function getNativeRelationshipButtonFieldValue(
  button: HTMLElement,
  entity: string,
  field: string,
) {
  const key =
    `${entity}${field.charAt(0).toUpperCase()}${field.slice(1)}` as keyof DOMStringMap;
  return normalizeRelationshipQueueValue(button.dataset[key] || "");
}

export function getNativeRelationshipCurrentFieldValue(
  entity: string,
  id: number,
  field: string,
) {
  const pack = (globalThis as { pack?: Record<string, any> }).pack;
  const collection =
    entity === "state"
      ? pack?.states
      : entity === "burg"
        ? pack?.burgs
        : entity === "province"
          ? pack?.provinces
          : undefined;
  const value = collection?.[id]?.[field];
  return value === undefined || value === null
    ? ""
    : normalizeRelationshipQueueValue(String(value));
}

export function createNativeRelationshipDatasetPayload(button: HTMLElement) {
  return Object.fromEntries(
    Object.entries(button.dataset).filter(([, value]) => value !== undefined),
  ) as Record<string, string>;
}

export function applyNativeRelationshipQueuedItems(
  items: NativeRelationshipQueueItem[],
  applyNativeRelationshipButtonPayload: (
    button: HTMLElement,
    entity: string,
    id: number,
  ) => void,
): NativeRelationshipQueueApplyResult {
  let target = "";
  const undoChanges: NativeRelationshipQueueUndoChange[] = [];

  items.forEach((item) => {
    const { entity, id } = getNativeRelationshipFixTarget(item.button);
    const field = item.fieldKey.split(":")[2] || "";
    if (!entity || !id || !field) return;

    undoChanges.push({
      entity,
      id,
      field,
      beforeValue: getNativeRelationshipCurrentFieldValue(entity, id, field),
      afterValue: item.targetValue,
      payload: createNativeRelationshipDatasetPayload(item.button),
    });
    applyNativeRelationshipButtonPayload(item.button, entity, id);
    target = item.target || target;
  });

  return { target, undoChanges };
}

export function createNativeRelationshipUndoButton(
  change: NativeRelationshipQueueUndoChange,
) {
  const button = document.createElement("button");
  Object.entries(change.payload).forEach(([key, value]) => {
    button.dataset[key] = value;
  });
  const dataKey = `${change.entity}${change.field.charAt(0).toUpperCase()}${change.field.slice(1)}`;
  button.dataset[dataKey] = change.beforeValue;
  return button;
}

export function reviewNativeRelationshipQueue(
  items: NativeRelationshipQueueItem[],
) {
  const counts = items.reduce(
    (next, item) => next.set(item.fieldKey, (next.get(item.fieldKey) || 0) + 1),
    new Map<string, number>(),
  );
  const itemStates = items.map((item) => {
    const { entity, id } = getNativeRelationshipFixTarget(item.button);
    const field = item.fieldKey.split(":")[2] || "";
    const currentValue =
      entity && id && field
        ? getNativeRelationshipCurrentFieldValue(entity, id, field)
        : "";
    const duplicate = (counts.get(item.fieldKey) || 0) > 1;
    const stale = Boolean(
      currentValue && item.sourceValue && currentValue !== item.sourceValue,
    );
    return { duplicate, stale };
  });
  return {
    itemStates,
    hasIssues: itemStates.some((item) => item.duplicate || item.stale),
  };
}

export function getNativeRelationshipQueueImpactSummary(
  items: NativeRelationshipQueueItem[],
) {
  const entityLabels: Record<string, string> = {
    state: "States",
    burg: "Burgs",
    province: "Provinces",
  };
  const groups = items.reduce((next, item) => {
    const [entity, , field] = item.fieldKey.split(":");
    const key = `${entity}:${field}`;
    const group = next.get(key) || { entity, field, count: 0 };
    group.count += 1;
    next.set(key, group);
    return next;
  }, new Map<string, { entity: string; field: string; count: number }>());
  return Array.from(groups.values())
    .map(
      (group) =>
        `${entityLabels[group.entity] || group.entity} ${group.field}: ${group.count}`,
    )
    .join(" 路 ");
}
