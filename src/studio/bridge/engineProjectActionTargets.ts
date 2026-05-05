type EngineProjectActionWindow = typeof globalThis & {
  applyOption?: (
    select: HTMLSelectElement,
    value: string,
    label: string,
  ) => void;
  heightmapTemplates?: Record<string, { name?: string }>;
  precreatedHeightmaps?: Record<string, { name?: string }>;
};

export type EngineProjectActionTargets = {
  getInput: (id: string) => HTMLInputElement | null;
  getOutput: (id: string) => HTMLOutputElement | null;
  getSelect: (id: string) => HTMLSelectElement | null;
  clickElement: (id: string) => void;
  dispatchInputAndChange: (element: HTMLElement) => void;
  dispatchChange: (element: HTMLElement) => void;
  findSelectOption: (
    select: HTMLSelectElement,
    value: string,
  ) => HTMLOptionElement | undefined;
  addSelectOption: (
    select: HTMLSelectElement,
    label: string,
    value: string,
  ) => void;
  applyOption: (
    select: HTMLSelectElement,
    value: string,
    label: string,
  ) => boolean;
  getTemplateLabel: (template: string) => string;
};

export type EngineProjectActionDomAdapter = {
  getInput: (id: string) => HTMLInputElement | null;
  getOutput: (id: string) => HTMLOutputElement | null;
  getSelect: (id: string) => HTMLSelectElement | null;
  clickElement: (id: string) => void;
  dispatchInputAndChange: (element: HTMLElement) => void;
  dispatchChange: (element: HTMLElement) => void;
};

export type EngineProjectActionSelectAdapter = {
  findSelectOption: (
    select: HTMLSelectElement,
    value: string,
  ) => HTMLOptionElement | undefined;
  addSelectOption: (
    select: HTMLSelectElement,
    label: string,
    value: string,
  ) => void;
};

export type EngineProjectActionRuntimeAdapter = {
  applyOption: (
    select: HTMLSelectElement,
    value: string,
    label: string,
  ) => boolean;
  getTemplateLabel: (template: string) => string;
};

function getActionWindow(): EngineProjectActionWindow {
  try {
    return (globalThis.window ?? globalThis) as EngineProjectActionWindow;
  } catch {
    return globalThis as EngineProjectActionWindow;
  }
}

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

function dispatchDomEvent(element: HTMLElement, type: string) {
  try {
    if (typeof globalThis.Event !== "function") return;
    element.dispatchEvent(new globalThis.Event(type, { bubbles: true }));
  } catch {
    // Compatibility DOM events are best-effort.
  }
}

export function createGlobalProjectActionTargets(): EngineProjectActionTargets {
  return createProjectActionTargets(
    createGlobalProjectActionDomAdapter(),
    createGlobalProjectActionSelectAdapter(),
    createGlobalProjectActionRuntimeAdapter(),
  );
}

export function createGlobalProjectActionDomAdapter(): EngineProjectActionDomAdapter {
  return {
    getInput: (id) => {
      try {
        return (
          (getDocument()?.getElementById(id) as
            | HTMLInputElement
            | null
            | undefined) ?? null
        );
      } catch {
        return null;
      }
    },
    getOutput: (id) => {
      try {
        return (
          (getDocument()?.getElementById(id) as
            | HTMLOutputElement
            | null
            | undefined) ?? null
        );
      } catch {
        return null;
      }
    },
    getSelect: (id) => {
      try {
        return (
          (getDocument()?.getElementById(id) as
            | HTMLSelectElement
            | null
            | undefined) ?? null
        );
      } catch {
        return null;
      }
    },
    clickElement: (id) => {
      try {
        getDocument()?.getElementById(id)?.click();
      } catch {
        // Compatibility DOM clicks are best-effort.
      }
    },
    dispatchInputAndChange: (element) => {
      dispatchDomEvent(element, "input");
      dispatchDomEvent(element, "change");
    },
    dispatchChange: (element) => {
      dispatchDomEvent(element, "change");
    },
  };
}

export function createGlobalProjectActionSelectAdapter(): EngineProjectActionSelectAdapter {
  return {
    findSelectOption: (select, value) => {
      try {
        return Array.from(select.options).find(
          (option) => option.value === value,
        );
      } catch {
        return undefined;
      }
    },
    addSelectOption: (select, label, value) => {
      try {
        if (typeof globalThis.Option !== "function") return;
        select.options.add(new globalThis.Option(label, value));
      } catch {
        // Browser select option writes are best-effort in compatibility mode.
      }
    },
  };
}

export function createGlobalProjectActionRuntimeAdapter(): EngineProjectActionRuntimeAdapter {
  return {
    applyOption: (select, value, label) => {
      try {
        const applyOption = getActionWindow().applyOption;
        if (typeof applyOption !== "function") return false;
        applyOption(select, value, label);
        return true;
      } catch {
        return false;
      }
    },
    getTemplateLabel: (template) => {
      try {
        const actionWindow = getActionWindow();
        return (
          actionWindow.heightmapTemplates?.[template]?.name ??
          actionWindow.precreatedHeightmaps?.[template]?.name ??
          template
        );
      } catch {
        return template;
      }
    },
  };
}

export function createProjectActionTargets(
  domAdapter: EngineProjectActionDomAdapter,
  selectAdapter: EngineProjectActionSelectAdapter,
  runtimeAdapter: EngineProjectActionRuntimeAdapter,
): EngineProjectActionTargets {
  return {
    getInput: domAdapter.getInput,
    getOutput: domAdapter.getOutput,
    getSelect: domAdapter.getSelect,
    clickElement: domAdapter.clickElement,
    dispatchInputAndChange: domAdapter.dispatchInputAndChange,
    dispatchChange: domAdapter.dispatchChange,
    findSelectOption: selectAdapter.findSelectOption,
    addSelectOption: selectAdapter.addSelectOption,
    applyOption: runtimeAdapter.applyOption,
    getTemplateLabel: runtimeAdapter.getTemplateLabel,
  };
}
