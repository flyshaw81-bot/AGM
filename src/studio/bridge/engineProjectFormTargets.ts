type EngineProjectFormWindow = typeof globalThis & {
  options?: {
    winds?: unknown[];
  };
};

export type EngineSelectOption = {
  value: string;
  label: string;
};

export type EngineCultureSetOption = EngineSelectOption & {
  max: string;
};

export type EngineProjectFormDomAdapter = {
  getElementById: (id: string) => HTMLElement | null;
  querySelector: (selector: string) => Element | null;
};

export type EngineProjectFormRuntimeAdapter = {
  getWinds: () => unknown[] | undefined;
};

export type EngineProjectFormTargets = {
  getInputValue: (id: string, fallback?: string) => string;
  getOutputValue: (id: string, fallback?: string) => string;
  getTextValue: (id: string, fallback?: string) => string;
  getSelect: (id: string) => HTMLSelectElement | null;
  getSelectValue: (
    select: HTMLSelectElement | null,
    fallback?: string,
  ) => string;
  getSelectedOptionLabel: (
    select: HTMLSelectElement | null,
    fallback?: string,
  ) => string;
  getSelectOptions: (select: HTMLSelectElement | null) => EngineSelectOption[];
  getCultureSetOptions: (
    select: HTMLSelectElement | null,
  ) => EngineCultureSetOption[];
  hasVisibleInlineDisplay: (id: string, fallback?: boolean) => boolean;
  getWindOption: (tier: number) => string;
  getWindTierRotation: (tier: number) => string;
};

function getFormWindow(): EngineProjectFormWindow {
  try {
    return (globalThis.window ?? globalThis) as EngineProjectFormWindow;
  } catch {
    return globalThis as EngineProjectFormWindow;
  }
}

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

export function createGlobalProjectFormDomAdapter(): EngineProjectFormDomAdapter {
  return {
    getElementById: (id) => {
      try {
        return getDocument()?.getElementById(id) ?? null;
      } catch {
        return null;
      }
    },
    querySelector: (selector) => {
      try {
        return getDocument()?.querySelector(selector) ?? null;
      } catch {
        return null;
      }
    },
  };
}

export function createGlobalProjectFormRuntimeAdapter(): EngineProjectFormRuntimeAdapter {
  return {
    getWinds: () => {
      try {
        return getFormWindow().options?.winds;
      } catch {
        return undefined;
      }
    },
  };
}

export function createProjectFormTargets(
  domAdapter: EngineProjectFormDomAdapter,
  runtimeAdapter: EngineProjectFormRuntimeAdapter,
): EngineProjectFormTargets {
  return {
    getInputValue: (id, fallback = "") =>
      (domAdapter.getElementById(id) as HTMLInputElement | null)?.value ||
      fallback,
    getOutputValue: (id, fallback = "") => {
      const output = domAdapter.getElementById(id) as HTMLOutputElement | null;
      return output?.value || output?.textContent?.trim() || fallback;
    },
    getTextValue: (id, fallback = "") =>
      domAdapter.getElementById(id)?.textContent?.trim() || fallback,
    getSelect: (id) =>
      (domAdapter.getElementById(id) as HTMLSelectElement | null) ?? null,
    getSelectValue: (select, fallback = "") => select?.value || fallback,
    getSelectedOptionLabel: (select, fallback = "") =>
      select?.selectedOptions?.[0]?.textContent?.trim() || fallback,
    getSelectOptions: (select) =>
      Array.from(select?.options || []).map((option) => ({
        value: option.value,
        label: option.textContent?.trim() || option.value,
      })),
    getCultureSetOptions: (select) =>
      Array.from(select?.options || []).map((option) => ({
        value: option.value,
        label: option.textContent?.trim() || option.value,
        max: option.dataset.max || "",
      })),
    hasVisibleInlineDisplay: (id, fallback = false) =>
      (domAdapter.getElementById(id)?.style.display ||
        (fallback ? "inline-block" : "none")) !== "none",
    getWindOption: (tier) => {
      const winds = runtimeAdapter.getWinds();
      return Array.isArray(winds) ? String(winds[tier] ?? "") : "";
    },
    getWindTierRotation: (tier) =>
      (
        domAdapter
          .querySelector(`#globeWindArrows path[data-tier='${tier}']`)
          ?.getAttribute("transform")
          ?.match(/rotate\(([-\d.]+)/)?.[1] || ""
      ).trim(),
  };
}

export function createGlobalProjectFormTargets(): EngineProjectFormTargets {
  return createProjectFormTargets(
    createGlobalProjectFormDomAdapter(),
    createGlobalProjectFormRuntimeAdapter(),
  );
}
