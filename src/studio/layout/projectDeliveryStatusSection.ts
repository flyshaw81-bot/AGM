import type { StudioState } from "../types";
import type { RelationshipRepairHealth } from "./directRelationshipRepairHealth";
import {
  getProjectDeliveryStatusLabel,
  getProjectStatusLabel,
} from "./projectPanelFormatters";
import { t } from "./shellShared";

type ActiveProject = StudioState["projectCenter"]["recentProjects"][number];

function getProjectRelationshipGateState(
  activeProject: ActiveProject | undefined,
  relationshipRepairHealth?: RelationshipRepairHealth,
) {
  if (relationshipRepairHealth) return relationshipRepairHealth.exportGate;
  if (activeProject?.deliveryStatus === "ready") return "ready";
  if (activeProject?.deliveryStatus === "needs-repair") return "blocked";
  return "unchecked";
}

function getRelationshipGateLabel(
  state: StudioState,
  activeProject: ActiveProject | undefined,
  relationshipRepairHealth?: RelationshipRepairHealth,
) {
  const gateState = getProjectRelationshipGateState(
    activeProject,
    relationshipRepairHealth,
  );
  if (gateState === "ready") {
    return t(state.language, "关系验证已通过", "Relationship gate passed");
  }
  if (gateState === "blocked") {
    return t(state.language, "关系验证阻塞", "Relationship gate blocked");
  }
  return t(state.language, "未检查", "Not checked");
}

function getEnginePackageReadinessLabel(
  state: StudioState,
  activeProject: ActiveProject | undefined,
  relationshipRepairHealth?: RelationshipRepairHealth,
) {
  if (
    getProjectRelationshipGateState(activeProject, relationshipRepairHealth) ===
    "blocked"
  ) {
    return t(state.language, "关系验证阻塞", "Relationship gate blocked");
  }
  return activeProject?.exportReady
    ? t(state.language, "已准备", "Ready")
    : t(state.language, "未导出", "Not exported");
}

function getDeliveryReadinessLabel(
  state: StudioState,
  activeProject: ActiveProject | undefined,
  relationshipRepairHealth?: RelationshipRepairHealth,
) {
  if (!relationshipRepairHealth) {
    return getProjectDeliveryStatusLabel(
      activeProject?.deliveryStatus,
      state.language,
    );
  }
  return relationshipRepairHealth.deliveryStatus === "ready"
    ? t(state.language, "可交付", "Ready to deliver")
    : t(state.language, "需要修复", "Needs repair");
}

export function renderProjectDeliveryStatusSection(
  state: StudioState,
  activeProject: ActiveProject | undefined,
  relationshipRepairHealth?: RelationshipRepairHealth,
) {
  const deliveryStatus =
    relationshipRepairHealth?.deliveryStatus ||
    activeProject?.deliveryStatus ||
    "unchecked";
  const relationshipGate = getProjectRelationshipGateState(
    activeProject,
    relationshipRepairHealth,
  );

  return `
    <section class="studio-panel" data-project-delivery-relationship-gate="${relationshipGate}" data-project-delivery-status="${deliveryStatus}">
      <h2 class="studio-panel__title">${t(state.language, "交付状态", "Delivery status")}</h2>
      <div class="studio-kv"><span>${t(state.language, "活动项目", "Active project")}</span><strong>${activeProject ? getProjectStatusLabel(activeProject.status, state.language) : t(state.language, "等待保存", "Pending save")}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "验证", "Validation")}</span><strong>${state.autoFixPreview.appliedDraftIds.length ? t(state.language, "已应用修复", "Fixes applied") : t(state.language, "待检查", "Needs review")}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "交付状态", "Delivery readiness")}</span><strong>${getDeliveryReadinessLabel(state, activeProject, relationshipRepairHealth)}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "关系验证", "Relationship gate")}</span><strong>${getRelationshipGateLabel(state, activeProject, relationshipRepairHealth)}</strong></div>
      <div class="studio-kv"><span>${t(state.language, "引擎包", "Engine package")}</span><strong>${getEnginePackageReadinessLabel(state, activeProject, relationshipRepairHealth)}</strong></div>
      ${
        relationshipRepairHealth
          ? `<div class="studio-kv"><span>${t(state.language, "阻塞问题", "Blocking issues")}</span><strong>${relationshipRepairHealth.blockingIssueCount}</strong></div>`
          : ""
      }
      <div class="studio-panel__actions">
        <button class="studio-ghost" data-studio-action="section" data-value="repair">${t(state.language, "进入验证", "Go to validation")}</button>
        <button class="studio-ghost studio-ghost--primary" data-studio-action="section" data-value="export">${t(state.language, "进入导出", "Go to export")}</button>
      </div>
    </section>
  `;
}
