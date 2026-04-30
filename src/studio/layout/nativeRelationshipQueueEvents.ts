import type { StudioState } from "../types";
import {
  applyNativeRelationshipQueuedItems,
  getNativeRelationshipQueueImpactSummary,
  type NativeRelationshipQueueItem,
} from "./nativeRelationshipQueue";
import { createNativeRelationshipQueueItem } from "./nativeRelationshipQueueBuilder";
import { queryNativeRelationshipQueueDom } from "./nativeRelationshipQueueDom";
import { bindNativeRelationshipQueueHistoryEvents } from "./nativeRelationshipQueueHistoryEvents";
import { renderNativeRelationshipQueueList } from "./nativeRelationshipQueueRenderer";
import {
  setNativeRelationshipQueueDetailsOpen,
  updateNativeRelationshipQueueActionScope,
} from "./nativeRelationshipQueueUi";
import { bindActionClick } from "./studioEventBinding";

type NativeRelationshipQueueEventsOptions = {
  state: StudioState;
  openDirectWorkbench: (targetId: string) => void;
  selectNativeRelationshipSource: (entity: string, id: number) => void;
  applyNativeRelationshipButtonPayload: (
    button: HTMLElement,
    entity: string,
    id: number,
  ) => void;
  onDirectRelationshipQueueHistoryChange: (
    history: StudioState["directEditor"]["relationshipQueueHistory"],
  ) => void;
};

export function bindNativeRelationshipQueueEvents({
  state,
  openDirectWorkbench,
  selectNativeRelationshipSource,
  applyNativeRelationshipButtonPayload,
  onDirectRelationshipQueueHistoryChange,
}: NativeRelationshipQueueEventsOptions) {
  const nativeRelationshipQueue: NativeRelationshipQueueItem[] = [];
  const queueDom = queryNativeRelationshipQueueDom();
  const {
    nativeRelationshipQueueApply,
    nativeRelationshipQueueDetails,
    nativeRelationshipQueueList,
    nativeRelationshipQueueToggle,
  } = queueDom;

  const setQueueDetailsOpen = (open: boolean) =>
    setNativeRelationshipQueueDetailsOpen(queueDom, state.language, open);
  const updateQueueActionScope = (
    message?: string,
    stateValue?: Parameters<typeof updateNativeRelationshipQueueActionScope>[2],
  ) => updateNativeRelationshipQueueActionScope(queueDom, message, stateValue);

  let renderNativeRelationshipHistory = () => {};
  const renderNativeRelationshipQueue = () =>
    renderNativeRelationshipQueueList({
      nativeRelationshipQueue,
      dom: queueDom,
      renderNativeRelationshipQueueHistory: renderNativeRelationshipHistory,
      updateNativeRelationshipQueueActionScope: updateQueueActionScope,
    });

  ({ renderNativeRelationshipHistory } =
    bindNativeRelationshipQueueHistoryEvents({
      state,
      queueDom,
      openDirectWorkbench,
      selectNativeRelationshipSource,
      applyNativeRelationshipButtonPayload,
      onDirectRelationshipQueueHistoryChange,
      renderNativeRelationshipQueue,
    }));

  const addNativeRelationshipQueueButton = (
    fixButton: HTMLElement,
    fallbackLabel: string,
  ) => {
    const queueItem = createNativeRelationshipQueueItem({
      existingItems: nativeRelationshipQueue,
      fallbackLabel,
      fixButton,
    });
    if (!queueItem) return;
    nativeRelationshipQueue.push(queueItem);
    renderNativeRelationshipQueue();
    setQueueDetailsOpen(true);
    updateQueueActionScope(
      `Queued ${queueItem.label} · ${queueItem.preview}`,
      "queued",
    );
  };

  nativeRelationshipQueueToggle?.addEventListener("click", () =>
    setQueueDetailsOpen(Boolean(nativeRelationshipQueueDetails?.hidden)),
  );

  bindActionClick("direct-relationship-queue-add", (button) => {
    const fixButton = button
      .closest<HTMLElement>(".studio-direct-workbench-directory__issue")
      ?.querySelector<HTMLElement>(
        "[data-studio-action='direct-relationship-fix']",
      );
    if (fixButton) {
      addNativeRelationshipQueueButton(
        fixButton,
        button.textContent?.trim() || "Queued repair",
      );
    }
  });

  bindActionClick("direct-relationship-queue-group", (button) => {
    const fixGroup = button.dataset.fixGroup || "";
    if (!fixGroup.includes("clear")) return;
    const group = button.closest<HTMLElement>(
      "[data-direct-relationship-group]",
    );
    const groupLabel =
      group
        ?.querySelector<HTMLElement>(
          ".studio-direct-workbench-directory__issue-group-main span",
        )
        ?.textContent?.trim() ||
      button.textContent?.trim() ||
      "Queued group";
    Array.from(
      group?.querySelectorAll<HTMLElement>(
        `[data-studio-action='direct-relationship-fix'][data-fix-kind='${fixGroup}']`,
      ) || [],
    ).forEach((fixButton) => {
      addNativeRelationshipQueueButton(fixButton, groupLabel);
    });
  });

  bindActionClick("direct-relationship-queue-page", (button) => {
    const page = button.closest<HTMLElement>(
      "[data-direct-relationship-hidden-page='true']",
    );
    const pageLabel = button.textContent?.trim() || "Queued page";
    Array.from(
      page?.querySelectorAll<HTMLElement>(
        "[data-studio-action='direct-relationship-fix']",
      ) || [],
    ).forEach((fixButton) => {
      addNativeRelationshipQueueButton(fixButton, pageLabel);
    });
  });

  nativeRelationshipQueueList?.addEventListener("click", (event) => {
    const button = (event.target as HTMLElement).closest<HTMLElement>(
      "[data-studio-action='direct-relationship-queue-remove']",
    );
    if (!button) return;
    const index = Number(button.dataset.queueIndex);
    if (!Number.isInteger(index)) return;
    nativeRelationshipQueue.splice(index, 1);
    renderNativeRelationshipQueue();
    updateQueueActionScope(
      nativeRelationshipQueue.length
        ? `Removed queued repair; ${nativeRelationshipQueue.length} repairs remain.`
        : undefined,
      nativeRelationshipQueue.length ? "queued" : "idle",
    );
  });

  nativeRelationshipQueueApply?.addEventListener("click", () => {
    if (renderNativeRelationshipQueue()) return;
    const queuedItems = nativeRelationshipQueue.splice(
      0,
      nativeRelationshipQueue.length,
    );
    const { target, undoChanges } = applyNativeRelationshipQueuedItems(
      queuedItems,
      applyNativeRelationshipButtonPayload,
    );
    const summary = getNativeRelationshipQueueImpactSummary(queuedItems);
    const resultText = `Applied ${queuedItems.length} queued repairs · ${summary}`;
    updateQueueActionScope(resultText, "applied");
    onDirectRelationshipQueueHistoryChange({
      id: Date.now(),
      count: queuedItems.length,
      summary,
      target,
      resultText,
      undoChanges,
      undone: false,
      undoBlockedReason: null,
    });
    if (state.section !== "repair") openDirectWorkbench(target);
  });
}
