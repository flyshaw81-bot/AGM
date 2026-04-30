import type { StudioState } from "../types";
import {
  createGlobalStudioThemeSyncTargets,
  type StudioThemeSyncTargets,
} from "./studioThemeSyncTargets";

export {
  createGlobalStudioThemeSyncTargets,
  createStudioThemeSyncTargets,
  type StudioThemeSyncTargets,
} from "./studioThemeSyncTargets";

export function syncStudioDocumentTheme(
  theme: StudioState["theme"],
  targets: StudioThemeSyncTargets = createGlobalStudioThemeSyncTargets(),
) {
  targets.setDocumentTheme(theme);
}
