import type { StudioState } from "../types";
import { renderNativeStudioShell } from "./nativeShell";

export { bindStudioShellEvents } from "./shellEvents";

export function renderStudioShell(state: StudioState) {
  return renderNativeStudioShell(state);
}
