type RuntimeHtmlActionWindow = Window &
  typeof globalThis & {
    Names?: { getMapName?: (force?: boolean) => void };
    handleLayersPresetChange?: (value: string) => void;
  } & Record<string, unknown>;

function getRuntimeWindow(): RuntimeHtmlActionWindow | undefined {
  try {
    return window as RuntimeHtmlActionWindow;
  } catch {
    return undefined;
  }
}

function getRuntimeDocument(): Document | undefined {
  try {
    return document;
  } catch {
    return undefined;
  }
}

function callRuntimeAction(name: string, ...args: unknown[]) {
  const runtime = getRuntimeWindow();
  const handler = runtime?.[name];
  if (typeof handler !== "function") return;
  handler.apply(runtime, args);
}

function bindClick(id: string, handler: (event: MouseEvent) => void) {
  const element = getRuntimeDocument()?.getElementById(id);
  if (!element) return;
  element.addEventListener("click", handler);
}

export function bindEngineHtmlControlActions() {
  const runtime = getRuntimeWindow();
  const doc = getRuntimeDocument();
  if (!runtime || !doc) return;

  bindClick("optionsTrigger", (event) =>
    callRuntimeAction("showOptions", event),
  );
  bindClick("regenerate", () => callRuntimeAction("regeneratePrompt"));
  bindClick("optionsHide", (event) => callRuntimeAction("hideOptions", event));
  bindClick("savePresetButton", () => callRuntimeAction("savePreset"));
  bindClick("removePresetButton", () => callRuntimeAction("removePreset"));
  bindClick("addStyleButton", () => callRuntimeAction("addStylePreset"));
  bindClick("removeStyleButton", () =>
    callRuntimeAction("requestRemoveStylePreset"),
  );
  bindClick("textureUrlButton", () => callRuntimeAction("textureProvideURL"));
  bindClick("mapNameRegenerate", () => runtime.Names?.getMapName?.(true));
  bindClick("configureWorld", () => callRuntimeAction("editWorld"));
  bindClick("optionsReset", () => callRuntimeAction("cleanupData"));
  bindClick("supportersLink", () => callRuntimeAction("showSupporters"));
  bindClick("hideEmblems", () => callRuntimeAction("invokeActiveZooming"));
  bindClick("hideLabels", () => callRuntimeAction("invokeActiveZooming"));
  bindClick("rescaleLabels", () => callRuntimeAction("invokeActiveZooming"));

  doc.getElementById("mapLayers")?.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const item = target?.closest<HTMLLIElement>("li[id^='toggle']");
    if (!item?.id) return;
    callRuntimeAction(item.id, event);
  });

  doc.getElementById("layersPreset")?.addEventListener("change", (event) => {
    const select = event.currentTarget as HTMLSelectElement | null;
    runtime.handleLayersPresetChange?.(select?.value ?? "");
  });
  doc.getElementById("stylePreset")?.addEventListener("change", (event) => {
    const select = event.currentTarget as HTMLSelectElement | null;
    callRuntimeAction("requestStylePresetChange", select?.value ?? "");
  });
}

const documentRef = getRuntimeDocument();
if (documentRef?.readyState === "loading") {
  documentRef.addEventListener(
    "DOMContentLoaded",
    bindEngineHtmlControlActions,
    {
      once: true,
    },
  );
} else {
  bindEngineHtmlControlActions();
}
