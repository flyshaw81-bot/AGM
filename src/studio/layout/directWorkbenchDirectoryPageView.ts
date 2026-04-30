import type { StudioLanguage } from "../types";
import { t } from "./shellShared";

type DirectWorkbenchDirectoryPageOptions = {
  language: StudioLanguage;
  summaryPanel: string;
  workbenchGrid: string;
};

export function renderDirectWorkbenchDirectoryPage({
  language,
  summaryPanel,
  workbenchGrid,
}: DirectWorkbenchDirectoryPageOptions) {
  return `
    <section class="studio-panel studio-direct-workbench-directory" aria-label="${t(language, "工作台目录", "Workbench directory")}">
      <div class="studio-direct-editor__header">
        <div>
          <div class="studio-panel__eyebrow">${t(language, "工作台目录", "Workbench directory")}</div>
          <h2 class="studio-panel__title">${t(language, "快速跳转编辑面板", "Jump to editing panels")}</h2>
        </div>
        <div class="studio-direct-editor__badge">${t(language, "导航仪表", "Navigator")}</div>
      </div>
      <p class="studio-panel__text">${t(language, "选择工作台即可跳转；修复队列和字段审计已移到左侧修复器。", "Choose a workbench to jump; repair queue and field audits now live in the Repair section.")}</p>
      ${summaryPanel}
      ${workbenchGrid}
    </section>
  `;
}
