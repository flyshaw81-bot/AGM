import { directWorkbenchStyles } from "./styleModules/directWorkbench";
import { foundationStyles } from "./styleModules/foundation";
import { panelsAndEditorsStyles } from "./styleModules/panelsAndEditors";
import { themeSystemStyles } from "./styleModules/themeSystem";
import { workspaceLayoutStyles } from "./styleModules/workspaceLayout";

const STUDIO_STYLE_SHEETS = [
  foundationStyles,
  directWorkbenchStyles,
  workspaceLayoutStyles,
  panelsAndEditorsStyles,
  themeSystemStyles,
];

export type StudioStyleTargets = {
  getStyleElement: (id: string) => HTMLElement | null;
  createStyleElement: () => HTMLStyleElement;
  appendToHead: (element: HTMLStyleElement) => void;
};

export function createGlobalStudioStyleTargets(): StudioStyleTargets {
  return {
    getStyleElement: (id) => document.getElementById(id),
    createStyleElement: () => document.createElement("style"),
    appendToHead: (element) => {
      document.head.appendChild(element);
    },
  };
}

export function injectStudioStyles(
  targets: StudioStyleTargets = createGlobalStudioStyleTargets(),
) {
  if (targets.getStyleElement("studioShellStyles")) return;

  const style = targets.createStyleElement();
  style.id = "studioShellStyles";
  style.textContent = STUDIO_STYLE_SHEETS.join("\n");
  targets.appendToHead(style);
}
