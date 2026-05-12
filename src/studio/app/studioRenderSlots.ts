export type StudioRenderSlot =
  | "topbar"
  | "iconbar"
  | "stage"
  | "drawer"
  | "layerbar"
  | "statusbar";

const V8_RENDER_SLOTS: Record<StudioRenderSlot, string> = {
  drawer: '[data-native-v8-info-panel="true"]',
  iconbar: ".studio-native-iconbar",
  layerbar: '[data-native-v8-bottom-bar="true"]',
  stage: ".studio-native-stage",
  statusbar: ".studio-native-v8-bottom__status",
  topbar: '[data-native-v8-topbar="true"]',
};

const lastRenderedShellHtml = new WeakMap<HTMLElement, string>();

function getRenderDocument(root?: HTMLElement): Document | undefined {
  try {
    return root?.ownerDocument ?? document;
  } catch {
    return undefined;
  }
}

function parseStudioHtml(html: string, root?: HTMLElement): HTMLElement | null {
  const renderDocument = getRenderDocument(root);
  if (!renderDocument) return null;
  const template = renderDocument.createElement("template");
  template.innerHTML = html.trim();
  const firstElement = template.content.firstElementChild;
  return firstElement instanceof HTMLElement ? firstElement : null;
}

function copyElementShellAttributes(target: HTMLElement, source: HTMLElement) {
  for (const attribute of Array.from(target.attributes)) {
    target.removeAttribute(attribute.name);
  }
  for (const attribute of Array.from(source.attributes)) {
    target.setAttribute(attribute.name, attribute.value);
  }
}

function replaceSlot(
  currentShell: HTMLElement,
  nextShell: HTMLElement,
  slot: StudioRenderSlot,
): boolean {
  if (slot === "drawer") {
    return replaceInfoPanelSlot(currentShell, nextShell);
  }

  const selector = V8_RENDER_SLOTS[slot];
  const currentSlot = currentShell.querySelector(selector);
  const nextSlot = nextShell.querySelector(selector);
  if (!currentSlot || !nextSlot) return false;
  if (currentSlot.isEqualNode(nextSlot)) return true;
  currentSlot.replaceWith(nextSlot);
  return true;
}

function replaceInfoPanelPart(
  currentPanel: Element,
  nextPanel: Element,
  selector: string,
): boolean {
  const currentPart = currentPanel.querySelector(selector);
  const nextPart = nextPanel.querySelector(selector);
  if (!currentPart && !nextPart) return true;
  if (!currentPart || !nextPart) return false;
  if (currentPart.isEqualNode(nextPart)) return true;
  currentPart.replaceWith(nextPart);
  return true;
}

function replaceInfoPanelSlot(
  currentShell: HTMLElement,
  nextShell: HTMLElement,
): boolean {
  const selector = V8_RENDER_SLOTS.drawer;
  const currentPanel = currentShell.querySelector<HTMLElement>(selector);
  const nextPanel = nextShell.querySelector<HTMLElement>(selector);
  if (!currentPanel || !nextPanel) return false;

  const tabsOk = replaceInfoPanelPart(
    currentPanel,
    nextPanel,
    '[data-native-v8-workbench-tabs="true"]',
  );
  const bodyOk = replaceInfoPanelPart(
    currentPanel,
    nextPanel,
    ".studio-native-v8-info-panel__body",
  );
  if (!tabsOk || !bodyOk) return false;

  copyElementShellAttributes(currentPanel, nextPanel);
  return true;
}

export function replaceStudioRenderSlots(
  root: HTMLElement,
  html: string,
): boolean {
  if (typeof root.querySelector !== "function") return false;

  const currentShell = root.querySelector<HTMLElement>(
    '#studioApp[data-native-ui="v8"]',
  );
  if (!currentShell) return false;

  const nextShell = parseStudioHtml(html, root);
  if (!nextShell?.matches('#studioApp[data-native-ui="v8"]')) return false;

  const slots: StudioRenderSlot[] = [
    "topbar",
    "iconbar",
    "stage",
    "drawer",
    "layerbar",
  ];
  if (!slots.every((slot) => replaceSlot(currentShell, nextShell, slot))) {
    return false;
  }

  copyElementShellAttributes(currentShell, nextShell);
  return true;
}

export function replaceStudioRootHtml(root: HTMLElement, html: string): void {
  if (lastRenderedShellHtml.get(root) === html || root.innerHTML === html) {
    lastRenderedShellHtml.set(root, html);
    return;
  }
  if (replaceStudioRenderSlots(root, html)) {
    lastRenderedShellHtml.set(root, html);
    return;
  }

  const renderDocument = getRenderDocument(root);
  if (!renderDocument || typeof root.replaceChildren !== "function") {
    Reflect.set(root, "innerHTML", html);
    lastRenderedShellHtml.set(root, html);
    return;
  }

  const template = renderDocument.createElement("template");
  template.innerHTML = html;
  root.replaceChildren(...Array.from(template.content.childNodes));
  lastRenderedShellHtml.set(root, html);
}
