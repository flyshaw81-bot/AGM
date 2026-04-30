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

export function injectStudioStyles() {
  if (document.getElementById("studioShellStyles")) return;

  const style = document.createElement("style");
  style.id = "studioShellStyles";
  style.textContent = STUDIO_STYLE_SHEETS.join("\n");
  document.head.appendChild(style);
}
