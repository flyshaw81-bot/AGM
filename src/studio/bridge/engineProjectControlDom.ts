export type EngineNumberPairOptions = {
  inputId: string;
  outputId: string;
  fallbackMin: string;
  fallbackMax: string;
  round: (value: number) => number;
  boundsSource?: "input-first" | "output-first";
};

export type EngineNumberPair = {
  input: HTMLInputElement;
  output: HTMLInputElement;
  nextValue: string;
};

function dispatchEngineFormEvent(
  element: HTMLInputElement | HTMLSelectElement,
  type: "input" | "change",
) {
  if (typeof globalThis.Event !== "function") return;
  element.dispatchEvent(new Event(type, { bubbles: true }));
}

function dispatchEngineInputEvent(
  element: HTMLInputElement | HTMLSelectElement,
) {
  dispatchEngineFormEvent(element, "input");
}

function dispatchEngineChangeEvent(
  element: HTMLInputElement | HTMLSelectElement,
) {
  dispatchEngineFormEvent(element, "change");
}

export function dispatchEnginePairInputEvents(pair: EngineNumberPair) {
  dispatchEngineInputEvent(pair.input);
  dispatchEngineInputEvent(pair.output);
}

export function dispatchEnginePairChangeEvents(pair: EngineNumberPair) {
  dispatchEngineChangeEvent(pair.input);
  dispatchEngineChangeEvent(pair.output);
}

function clampEngineNumber(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function setEngineNumberPair(
  value: number,
  options: EngineNumberPairOptions,
): EngineNumberPair | null {
  const input = globalThis.document?.getElementById(
    options.inputId,
  ) as HTMLInputElement | null;
  const output = globalThis.document?.getElementById(
    options.outputId,
  ) as HTMLInputElement | null;
  if (!input || !output || !Number.isFinite(value)) return null;

  const minSource =
    options.boundsSource === "output-first"
      ? output.min || input.min
      : input.min || output.min;
  const maxSource =
    options.boundsSource === "output-first"
      ? output.max || input.max
      : input.max || output.max;
  const min = Number(minSource || options.fallbackMin);
  const max = Number(maxSource || options.fallbackMax);
  const nextValue = String(clampEngineNumber(options.round(value), min, max));
  input.value = nextValue;
  output.value = nextValue;
  return { input, output, nextValue };
}

export function lockEngineStoredSetting(
  input: HTMLInputElement,
  output: HTMLInputElement,
  fallback: string,
) {
  const stored = input.dataset.stored || output.dataset.stored || fallback;
  const lock = (
    globalThis.window as Window & typeof globalThis & { lock?: unknown }
  )?.lock;
  if (typeof lock === "function") lock(stored);
}
