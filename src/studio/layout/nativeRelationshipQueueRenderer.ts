import {
  getNativeRelationshipQueueImpactSummary,
  type NativeRelationshipQueueItem,
  reviewNativeRelationshipQueue,
} from "./nativeRelationshipQueue";
import type { queryNativeRelationshipQueueDom } from "./nativeRelationshipQueueDom";

type NativeRelationshipQueueDom = ReturnType<
  typeof queryNativeRelationshipQueueDom
>;

type NativeRelationshipQueueRendererDom = Pick<
  NativeRelationshipQueueDom,
  | "nativeRelationshipQueueApply"
  | "nativeRelationshipQueueCount"
  | "nativeRelationshipQueueList"
  | "nativeRelationshipQueueReview"
  | "nativeRelationshipQueueRoot"
  | "nativeRelationshipQueueSummary"
>;

type RenderNativeRelationshipQueueOptions = {
  nativeRelationshipQueue: NativeRelationshipQueueItem[];
  dom: NativeRelationshipQueueRendererDom;
  renderNativeRelationshipQueueHistory: () => void;
  updateNativeRelationshipQueueActionScope: (
    message?: string,
    stateValue?: "idle" | "queued" | "conflict" | "applied",
  ) => void;
};

export function renderNativeRelationshipQueueList({
  nativeRelationshipQueue,
  dom,
  renderNativeRelationshipQueueHistory,
  updateNativeRelationshipQueueActionScope,
}: RenderNativeRelationshipQueueOptions) {
  const {
    nativeRelationshipQueueApply,
    nativeRelationshipQueueCount,
    nativeRelationshipQueueList,
    nativeRelationshipQueueReview,
    nativeRelationshipQueueRoot,
    nativeRelationshipQueueSummary,
  } = dom;
  if (
    !nativeRelationshipQueueList ||
    !nativeRelationshipQueueCount ||
    !nativeRelationshipQueueApply
  )
    return false;
  const review = reviewNativeRelationshipQueue(nativeRelationshipQueue);
  nativeRelationshipQueueCount.textContent = String(
    nativeRelationshipQueue.length,
  );
  nativeRelationshipQueueApply.disabled =
    nativeRelationshipQueue.length === 0 || review.hasIssues;
  renderNativeRelationshipQueueHistory();
  if (nativeRelationshipQueueReview) {
    nativeRelationshipQueueReview.dataset.reviewState =
      nativeRelationshipQueue.length
        ? review.hasIssues
          ? "conflict"
          : "ready"
        : "empty";
    nativeRelationshipQueueReview.textContent = nativeRelationshipQueue.length
      ? review.hasIssues
        ? nativeRelationshipQueueRoot?.dataset.conflictLabel ||
          "Queue needs review"
        : nativeRelationshipQueueRoot?.dataset.readyLabel ||
          "Queue is ready to apply."
      : nativeRelationshipQueueRoot?.dataset.emptyLabel || "Queue is empty";
  }
  const scopeSummary = nativeRelationshipQueue.length
    ? getNativeRelationshipQueueImpactSummary(nativeRelationshipQueue)
    : "";
  if (nativeRelationshipQueueSummary) {
    nativeRelationshipQueueSummary.hidden =
      nativeRelationshipQueue.length === 0;
    nativeRelationshipQueueSummary.textContent = nativeRelationshipQueue.length
      ? `Impact summary: ${scopeSummary}`
      : "";
  }
  if (review.hasIssues)
    updateNativeRelationshipQueueActionScope(
      `Queue blocked: review duplicate or stale fields before applying · ${scopeSummary}`,
      "conflict",
    );
  else if (nativeRelationshipQueue.length)
    updateNativeRelationshipQueueActionScope(
      `Ready to apply ${nativeRelationshipQueue.length} queued repairs · ${scopeSummary}`,
      "queued",
    );
  else updateNativeRelationshipQueueActionScope();
  nativeRelationshipQueueList.innerHTML = "";
  if (!nativeRelationshipQueue.length) {
    const empty = document.createElement("span");
    empty.className = "studio-direct-workbench-directory__queue-empty";
    empty.textContent =
      nativeRelationshipQueueRoot?.dataset.emptyLabel || "Queue is empty";
    nativeRelationshipQueueList.append(empty);
    return false;
  }
  nativeRelationshipQueue.forEach((item, index) => {
    const itemState = review.itemStates[index];
    const row = document.createElement("div");
    row.className = `studio-direct-workbench-directory__queue-item${itemState?.duplicate ? " is-duplicate" : ""}${itemState?.stale ? " is-stale" : ""}`;
    row.dataset.queueIndex = String(index);
    const copy = document.createElement("span");
    copy.innerHTML = `<strong></strong><code></code><em></em>`;
    copy.querySelector("strong")!.textContent = item.label;
    copy.querySelector("code")!.textContent = item.preview;
    copy.querySelector("em")!.textContent = itemState?.duplicate
      ? "Duplicate field"
      : itemState?.stale
        ? "Source changed"
        : `${item.fieldKey} · ${item.sourceValue || "—"} → ${item.targetValue || "—"}`;
    const remove = document.createElement("button");
    remove.className =
      "studio-ghost studio-direct-workbench-directory__queue-remove";
    remove.dataset.studioAction = "direct-relationship-queue-remove";
    remove.dataset.queueIndex = String(index);
    remove.textContent = "×";
    row.append(copy, remove);
    nativeRelationshipQueueList.append(row);
  });
  return review.hasIssues;
}
