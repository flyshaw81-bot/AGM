import { directWorkbenchStyles } from "./styleModules/directWorkbench";
import { foundationStyles } from "./styleModules/foundation";
import { panelsAndEditorsStyles } from "./styleModules/panelsAndEditors";
import { themeSystemStyles } from "./styleModules/themeSystem";
import { workspaceLayoutStyles } from "./styleModules/workspaceLayout";
import {
  createGlobalStudioStyleTargets,
  type StudioStyleTargets,
} from "./stylesTargets";

export {
  createGlobalStudioStyleTargets,
  createStudioStyleTargets,
  type StudioStyleTargets,
} from "./stylesTargets";

const STUDIO_STYLE_SHEETS = [
  foundationStyles,
  directWorkbenchStyles,
  workspaceLayoutStyles,
  panelsAndEditorsStyles,
  themeSystemStyles,
];

export function injectStudioStyles(
  targets: StudioStyleTargets = createGlobalStudioStyleTargets(),
) {
  if (targets.getStyleElement("studioShellStyles")) return;

  const style = targets.createStyleElement();
  style.id = "studioShellStyles";
  style.textContent = STUDIO_STYLE_SHEETS.join("\n");
  targets.appendToHead(style);
}
