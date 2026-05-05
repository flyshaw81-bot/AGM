import {
  type DirectRelationshipQueueItem,
  getDirectRelationshipButtonFieldValue,
  getDirectRelationshipCurrentFieldValue,
  getDirectRelationshipFixField,
  getDirectRelationshipFixTarget,
  normalizeRelationshipQueueValue,
} from "./nativeRelationshipQueue";

type CreateDirectRelationshipQueueItemOptions = {
  existingItems: readonly DirectRelationshipQueueItem[];
  fallbackLabel: string;
  fixButton: HTMLElement;
};

const RELATIONSHIP_PREVIEW_SEPARATOR = /\s*(?:->|=>|→|鈫\?|閳玕?|鈫抾->)\s*/u;

export function parseDirectRelationshipQueuePreview(preview: string) {
  const [source = "", target = ""] = preview
    .split(RELATIONSHIP_PREVIEW_SEPARATOR, 2)
    .map((value) => normalizeRelationshipQueueValue(value || ""));
  return { source, target };
}

export function createDirectRelationshipQueueItem({
  existingItems,
  fallbackLabel,
  fixButton,
}: CreateDirectRelationshipQueueItemOptions): DirectRelationshipQueueItem | null {
  const { fixKind, entity, id } = getDirectRelationshipFixTarget(fixButton);
  if (!entity || !id) return null;

  const field = getDirectRelationshipFixField(fixKind);
  const key = `${fixKind}:${entity}:${id}`;
  if (existingItems.some((item) => item.key === key)) return null;

  const preview =
    fixButton
      .closest<HTMLElement>(".studio-direct-workbench-directory__issue")
      ?.querySelector<HTMLElement>(
        "[data-direct-relationship-preview='true'] code",
      )
      ?.textContent?.trim() ||
    fixButton.textContent?.trim() ||
    fallbackLabel;
  const { source: previewSource, target: previewTarget } =
    parseDirectRelationshipQueuePreview(preview);
  const label =
    fixButton
      .closest<HTMLElement>(".studio-direct-workbench-directory__issue")
      ?.querySelector<HTMLElement>(
        ".studio-direct-workbench-directory__issue-title",
      )
      ?.textContent?.trim() || fallbackLabel;

  return {
    key,
    fieldKey: `${entity}:${id}:${field}`,
    label,
    preview,
    target: fixButton.dataset.workbenchTarget || "",
    sourceValue:
      previewSource ||
      getDirectRelationshipCurrentFieldValue(entity, id, field),
    targetValue:
      previewTarget ||
      getDirectRelationshipButtonFieldValue(fixButton, entity, field),
    button: fixButton.cloneNode(true) as HTMLElement,
  };
}

export type CreateNativeRelationshipQueueItemOptions =
  CreateDirectRelationshipQueueItemOptions;

export const parseNativeRelationshipQueuePreview =
  parseDirectRelationshipQueuePreview;
export const createNativeRelationshipQueueItem =
  createDirectRelationshipQueueItem;
