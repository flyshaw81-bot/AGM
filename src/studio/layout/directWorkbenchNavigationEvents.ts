import type { StudioSection } from "../types";
import { bindActionClick } from "./studioEventBinding";

type DirectWorkbenchNavigationOptions = {
  onSectionChange: (section: StudioSection) => void;
};

export function bindDirectWorkbenchNavigationEvents({
  onSectionChange,
}: DirectWorkbenchNavigationOptions) {
  const jumpToDirectWorkbench = (targetId: string) => {
    const target = document.getElementById(targetId);
    if (!target) return;
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
    if (document.getElementById(targetId)) {
      jumpToDirectWorkbench(targetId);
      return;
    }
    onSectionChange("editors");
    window.setTimeout(() => jumpToDirectWorkbench(targetId), 0);
  };

  bindActionClick("direct-workbench-jump", (button) => {
    const targetId = button.dataset.workbenchTarget || "";
    if (!document.getElementById(targetId)) return;
    document
      .querySelectorAll<HTMLElement>(
        "[data-studio-action='direct-workbench-jump'].is-active",
      )
      .forEach((item) => {
        item.classList.remove("is-active");
      });
    button.classList.add("is-active");
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
