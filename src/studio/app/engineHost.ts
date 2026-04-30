import {
  createGlobalEngineHostTargets,
  type EngineHostTargets,
} from "./engineHostTargets";

export function ensureStudioRoot(targets = createGlobalEngineHostTargets()) {
  let root = targets.getElementById("studioRoot");
  if (!root) {
    root = targets.createElement("div");
    root.id = "studioRoot";
    targets.appendToBody(root);
  }
  return root;
}

export function ensureEngineDialogsContainer(
  targets = createGlobalEngineHostTargets(),
) {
  let dialogs = targets.getElementById("dialogs");
  if (!dialogs) {
    dialogs = targets.createElement("div");
    dialogs.id = "dialogs";
    targets.appendToBody(dialogs);
  }
  return dialogs;
}

export function preserveEngineNode(
  root: HTMLElement,
  elementId: string,
  targets = createGlobalEngineHostTargets(),
) {
  const element = targets.getElementById(elementId);
  if (element && root.contains(element)) {
    targets.appendToBody(element);
  }
}

export function relocateEngineMapHost(
  targets = createGlobalEngineHostTargets(),
) {
  const host = targets.getElementById("studioMapHost");
  const map = targets.getElementById("map");
  ensureEngineDialogsContainer(targets);
  if (host && map && !host.contains(map)) host.appendChild(map);
}

export function syncEngineDialogsPosition(
  targets: EngineHostTargets = createGlobalEngineHostTargets(),
) {
  const stage = targets.getElementById("studioStageViewport");
  if (!stage) return;

  const bounds = stage.getBoundingClientRect();
  const padding = 8;
  const dialogs = targets.queryDialogs();

  dialogs.forEach((dialog) => {
    const rect = dialog.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const minLeft = bounds.left + padding;
    const maxLeft = Math.max(bounds.right - width - padding, minLeft);
    const minTop = bounds.top + padding;
    const maxTop = Math.max(bounds.bottom - height - padding, minTop);

    let nextLeft = Number.parseFloat(dialog.style.left || `${rect.left}`);
    let nextTop = Number.parseFloat(dialog.style.top || `${rect.top}`);

    if (rect.left < minLeft || rect.right > bounds.right - padding) {
      nextLeft = Math.min(Math.max(nextLeft, minLeft), maxLeft);
    }

    if (rect.top < minTop || rect.bottom > bounds.bottom - padding) {
      nextTop = Math.min(Math.max(nextTop, minTop), maxTop);
    }

    dialog.style.left = `${nextLeft}px`;
    dialog.style.top = `${nextTop}px`;
  });
}
