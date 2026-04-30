import type { StudioLanguage } from "../types";
import type { queryNativeRelationshipQueueDom } from "./nativeRelationshipQueueDom";
import { t } from "./shellShared";

type NativeRelationshipQueueDom = ReturnType<
  typeof queryNativeRelationshipQueueDom
>;

type NativeRelationshipQueueUiDom = Pick<
  NativeRelationshipQueueDom,
  | "nativeRelationshipQueueActionScope"
  | "nativeRelationshipQueueDetails"
  | "nativeRelationshipQueueToggle"
>;

export type NativeRelationshipQueueActionState =
  | "idle"
  | "queued"
  | "conflict"
  | "applied";

export function setNativeRelationshipQueueDetailsOpen(
  dom: NativeRelationshipQueueUiDom,
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

export function updateNativeRelationshipQueueActionScope(
  dom: NativeRelationshipQueueUiDom,
  message?: string,
  stateValue: NativeRelationshipQueueActionState = "idle",
) {
  const { nativeRelationshipQueueActionScope } = dom;
  if (!nativeRelationshipQueueActionScope) return;
  nativeRelationshipQueueActionScope.dataset.actionState = stateValue;
  nativeRelationshipQueueActionScope.textContent =
    message ||
    nativeRelationshipQueueActionScope.dataset.defaultLabel ||
    "Apply writes the whole queue; Review only navigates and does not edit.";
}
