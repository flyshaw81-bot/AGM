import { getDirectRelationshipSourceWorkbenchTarget } from "./directWorkbenchTargets";
import {
  focusNativeRelationshipField,
  getNativeRelationshipFieldInputId,
} from "./nativeRelationshipFocus";
import { createNativeRelationshipButtonPayload } from "./nativeRelationshipPayloads";
import { getNativeRelationshipFixTarget } from "./nativeRelationshipQueue";
import { bindActionClick, bindClickSelector } from "./studioEventBinding";

type BindNativeRelationshipReferenceEventsOptions = {
  openDirectWorkbench: (targetId: string) => void;
  onDirectStateSelect: (stateId: number) => void;
  onDirectStateApply: (
    stateId: number,
    next: {
      name: string;
      formName: string;
      fullName: string;
      form?: string;
      color?: string;
      culture?: number;
      capital?: number;
      population?: number;
      rural?: number;
      urban?: number;
      neighbors?: number[];
      diplomacy?: string[];
    },
  ) => void;
  onDirectBurgSelect: (burgId: number) => void;
  onDirectBurgApply: (
    burgId: number,
    next: {
      name: string;
      type?: string;
      state?: number;
      culture?: number;
      population?: number;
    },
  ) => void;
  onDirectProvinceSelect: (provinceId: number) => void;
  onDirectProvinceApply: (
    provinceId: number,
    next: {
      name: string;
      fullName?: string;
      type?: string;
      state?: number;
      burg?: number;
      color?: string;
    },
  ) => void;
};

export function bindNativeRelationshipReferenceEvents({
  openDirectWorkbench,
  onDirectStateSelect,
  onDirectStateApply,
  onDirectBurgSelect,
  onDirectBurgApply,
  onDirectProvinceSelect,
  onDirectProvinceApply,
}: BindNativeRelationshipReferenceEventsOptions) {
  const selectNativeRelationshipSource = (entity: string, id: number) => {
    if (!id) return;
    const target = getDirectRelationshipSourceWorkbenchTarget(entity);
    if (!target) return;

    if (entity === "state") onDirectStateSelect(id);
    else if (entity === "burg") onDirectBurgSelect(id);
    else if (entity === "province") onDirectProvinceSelect(id);
    openDirectWorkbench(target);
  };

  const applyNativeRelationshipButtonPayload = (
    button: HTMLElement,
    entity: string,
    id: number,
  ) => {
    const payload = createNativeRelationshipButtonPayload(
      button.dataset,
      entity,
    );
    if (!payload) return;
    if (payload.entity === "state") onDirectStateApply(id, payload.next);
    if (payload.entity === "burg") onDirectBurgApply(id, payload.next);
    if (payload.entity === "province") onDirectProvinceApply(id, payload.next);
  };

  bindActionClick("direct-relationship-select-source", (button) =>
    selectNativeRelationshipSource(
      button.dataset.sourceEntity || "",
      Number(button.dataset.sourceId),
    ),
  );

  const reviewNativeRelationshipIssueField = (button: HTMLElement) => {
    const entity = button.dataset.editEntity || "";
    const id = Number(button.dataset.editId);
    const field = button.dataset.editField || "";
    selectNativeRelationshipSource(entity, id);
    const fieldId = getNativeRelationshipFieldInputId(entity, field);
    if (fieldId) focusNativeRelationshipField(fieldId);
  };

  bindClickSelector(
    "[data-studio-action='direct-relationship-edit-reference'], [data-studio-action='direct-relationship-review-field'], [data-studio-action='direct-relationship-review-page']",
    reviewNativeRelationshipIssueField,
  );

  bindActionClick("direct-relationship-fix", (button) => {
    const { entity, id } = getNativeRelationshipFixTarget(button);
    if (!entity || !id) return;
    applyNativeRelationshipButtonPayload(button, entity, id);
    openDirectWorkbench(button.dataset.workbenchTarget || "");
  });

  bindActionClick("direct-relationship-fix-group", (button) => {
    const fixGroup = button.dataset.fixGroup || "";
    if (!fixGroup.includes("clear")) return;
    const group = button.closest<HTMLElement>(
      "[data-direct-relationship-group]",
    );
    const fixButtons = Array.from(
      group?.querySelectorAll<HTMLElement>(
        `[data-studio-action='direct-relationship-fix'][data-fix-kind='${fixGroup}']`,
      ) || [],
    );
    fixButtons.forEach((fixButton) => {
      const { entity, id } = getNativeRelationshipFixTarget(fixButton);
      if (entity && id) {
        applyNativeRelationshipButtonPayload(fixButton, entity, id);
      }
    });
    openDirectWorkbench(button.dataset.workbenchTarget || "");
  });

  bindActionClick("direct-relationship-replace-reference", (button) => {
    const entity = button.dataset.replaceEntity || "";
    const id = Number(button.dataset.replaceId);
    if (!entity || !id) return;
    applyNativeRelationshipButtonPayload(button, entity, id);
    openDirectWorkbench(button.dataset.workbenchTarget || "");
  });

  bindActionClick(
    "direct-relationship-replace-visible-candidates",
    (button) => {
      const group = button.closest<HTMLElement>(
        "[data-direct-relationship-group]",
      );
      const candidateButtons = Array.from(
        group?.querySelectorAll<HTMLElement>(
          ":scope > .studio-direct-workbench-directory__issue > .studio-direct-workbench-directory__issue-candidates [data-studio-action='direct-relationship-replace-reference']",
        ) || [],
      );
      const firstCandidateByIssue = new Map<HTMLElement, HTMLElement>();
      candidateButtons.forEach((candidateButton) => {
        const issue = candidateButton.closest<HTMLElement>(
          ".studio-direct-workbench-directory__issue",
        );
        if (issue && !firstCandidateByIssue.has(issue)) {
          firstCandidateByIssue.set(issue, candidateButton);
        }
      });
      firstCandidateByIssue.forEach((candidateButton) => {
        const entity = candidateButton.dataset.replaceEntity || "";
        const id = Number(candidateButton.dataset.replaceId);
        if (entity && id) {
          applyNativeRelationshipButtonPayload(candidateButton, entity, id);
        }
      });
      openDirectWorkbench(button.dataset.workbenchTarget || "");
    },
  );

  return {
    applyNativeRelationshipButtonPayload,
    selectNativeRelationshipSource,
  };
}
