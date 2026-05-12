import type { StudioEditorModule, StudioSection } from "../types";
import { getDirectWorkbenchModuleForTarget } from "./directWorkbenchTargets";
import { bindActionClick } from "./studioEventBinding";

type DirectWorkbenchNavigationOptions = {
  onEditorModuleChange: (module: StudioEditorModule) => void;
  onSectionChange: (section: StudioSection) => void;
};

const ENTITY_PARENT_MODULES: readonly StudioEditorModule[] = [
  "states",
  "cultures",
  "religions",
  "provinces",
  "burgs",
  "diplomacy",
];

const MAP_FEATURE_PARENT_MODULES: readonly StudioEditorModule[] = [
  "routes",
  "markers",
  "zones",
];

function isV8IconbarParentActive(
  item: HTMLElement,
  module: StudioEditorModule | null,
) {
  if (!item.closest(".studio-native-iconbar")) return false;
  if (item.dataset.value === "states") {
    return Boolean(module && ENTITY_PARENT_MODULES.includes(module));
  }
  if (item.dataset.value === "mapFeatures") {
    return Boolean(module && MAP_FEATURE_PARENT_MODULES.includes(module));
  }
  return item.dataset.value === module;
}

export function bindDirectWorkbenchNavigationEvents({
  onEditorModuleChange,
  onSectionChange,
}: DirectWorkbenchNavigationOptions) {
  const markActiveDirectWorkbenchButton = (targetId: string) => {
    const module = getDirectWorkbenchModuleForTarget(targetId);
    document
      .querySelectorAll<HTMLElement>(
        "[data-studio-action='direct-workbench-jump']",
      )
      .forEach((item) => {
        const active =
          item.dataset.workbenchTarget === targetId ||
          isV8IconbarParentActive(item, module);
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", active ? "true" : "false");
      });
  };

  const jumpToDirectWorkbench = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const compatibilityDrawer = target.closest<HTMLDetailsElement>(
      "details[data-native-editor-compat='true']",
    );
    if (compatibilityDrawer) compatibilityDrawer.open = true;
    document
      .querySelectorAll<HTMLElement>(".studio-direct-editor.is-jump-highlight")
      .forEach((panel) => {
        panel.classList.remove("is-jump-highlight");
      });
    target.classList.add("is-jump-highlight");
    target.scrollIntoView({ block: "start", behavior: "smooth" });
    window.setTimeout(() => target.classList.remove("is-jump-highlight"), 1600);
  };

  const openDirectWorkbench = (targetId: string) => {
    if (!targetId) return;
    const module = getDirectWorkbenchModuleForTarget(targetId);
    if (module) {
      onEditorModuleChange(module);
      window.setTimeout(() => {
        markActiveDirectWorkbenchButton(targetId);
        jumpToDirectWorkbench(targetId);
      }, 0);
      return;
    }
    if (document.getElementById(targetId)) {
      jumpToDirectWorkbench(targetId);
      return;
    }
    onSectionChange("editors");
    window.setTimeout(() => {
      markActiveDirectWorkbenchButton(targetId);
      jumpToDirectWorkbench(targetId);
    }, 0);
  };

  bindActionClick("direct-workbench-jump", (button) => {
    const targetId = button.dataset.workbenchTarget || "";
    markActiveDirectWorkbenchButton(targetId);
    openDirectWorkbench(targetId);
  });

  bindActionClick("direct-workbench-review-applied", (button) => {
    if (button.hasAttribute("disabled")) return;
    const targetId = button.dataset.workbenchTarget || "";
    openDirectWorkbench(targetId);
  });

  bindActionClick("direct-workbench-open-repair", (button) => {
    if (button.hasAttribute("disabled")) return;
    onSectionChange("repair");
  });

  bindActionClick("direct-workbench-review-relationship", (button) => {
    if (button.hasAttribute("disabled")) return;
    const targetId = button.dataset.workbenchTarget || "";
    openDirectWorkbench(targetId);
  });

  return {
    jumpToDirectWorkbench,
    openDirectWorkbench,
  };
}
