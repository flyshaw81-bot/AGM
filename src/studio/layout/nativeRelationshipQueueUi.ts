import type { StudioLanguage } from "../types";
import type { queryDirectRelationshipQueueDom } from "./nativeRelationshipQueueDom";
import { t } from "./shellShared";

type DirectRelationshipQueueDom = ReturnType<
  typeof queryDirectRelationshipQueueDom
>;

type DirectRelationshipQueueUiDom = Pick<
  DirectRelationshipQueueDom,
  | "nativeRelationshipQueueActionScope"
  | "nativeRelationshipQueueDetails"
  | "nativeRelationshipQueueToggle"
>;

export type DirectRelationshipQueueActionState =
  | "idle"
  | "queued"
  | "conflict"
  | "applied";

export function setDirectRelationshipQueueDetailsOpen(
  dom: DirectRelationshipQueueUiDom,
  language: StudioLanguage,
  open: boolean,
) {
  const { nativeRelationshipQueueDetails, nativeRelationshipQueueToggle } = dom;
  if (!nativeRelationshipQueueDetails || !nativeRelationshipQueueToggle) return;
  nativeRelationshipQueueDetails.hidden = !open;
  nativeRelationshipQueueToggle.textContent = open
    ? t(language, "收起", "Collapse")
    : t(language, "展开", "Details");
}

export function updateDirectRelationshipQueueActionScope(
  dom: DirectRelationshipQueueUiDom,
  message?: string,
  stateValue: DirectRelationshipQueueActionState = "idle",
) {
  const { nativeRelationshipQueueActionScope } = dom;
  if (!nativeRelationshipQueueActionScope) return;
  nativeRelationshipQueueActionScope.dataset.actionState = stateValue;
  nativeRelationshipQueueActionScope.textContent =
    message ||
    nativeRelationshipQueueActionScope.dataset.defaultLabel ||
    "Apply writes the whole queue; Review only navigates and does not edit.";
}

export type NativeRelationshipQueueActionState =
  DirectRelationshipQueueActionState;
export type NativeRelationshipQueueDom = DirectRelationshipQueueDom;
export type NativeRelationshipQueueUiDom = DirectRelationshipQueueUiDom;

export const setNativeRelationshipQueueDetailsOpen =
  setDirectRelationshipQueueDetailsOpen;
export const updateNativeRelationshipQueueActionScope =
  updateDirectRelationshipQueueActionScope;
