export type DirectEditStatus = "clean" | "dirty" | "saved";

type NativeValueElement = {
  id: string;
  value: string;
};

type NativeValueInput =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export function setDirectEditStatus(
  statusElement: HTMLElement | null,
  status: DirectEditStatus,
) {
  if (!statusElement) return;
  statusElement.dataset.status = status;
  statusElement.textContent =
    status === "dirty"
      ? statusElement.dataset.dirtyLabel || "Unsaved changes"
      : status === "saved"
        ? statusElement.dataset.savedLabel || "Applied"
        : statusElement.dataset.cleanLabel || "No changes";
}

export function hasNativeInputChanges(
  inputs: ReadonlyArray<NativeValueElement>,
  initialValues: ReadonlyMap<string, string>,
) {
  return inputs.some((input) => input.value !== initialValues.get(input.id));
}

export function queryNativeValueInputs(ids: readonly string[]) {
  return ids
    .map((id) => document.getElementById(id) as NativeValueInput | null)
    .filter((input): input is NativeValueInput => Boolean(input));
}

export function getNativeInput(id: string) {
  return document.getElementById(id) as HTMLInputElement | null;
}

export function getNativeTextArea(id: string) {
  return document.getElementById(id) as HTMLTextAreaElement | null;
}

export function getNativeSelect(id: string) {
  return document.getElementById(id) as HTMLSelectElement | null;
}

export function readNativeInputValue(id: string, fallback = "") {
  return getNativeInput(id)?.value || fallback;
}

export function readNativeNumberValue(id: string) {
  return Number(readNativeInputValue(id) || Number.NaN);
}

export function readNativeSelectValue(id: string, fallback = "") {
  return getNativeSelect(id)?.value || fallback;
}

export function createNativeDirtyTracker(
  statusElement: HTMLElement | null,
  inputs: ReadonlyArray<NativeValueInput>,
) {
  const initialValues = new Map(inputs.map((input) => [input.id, input.value]));
  const setStatus = (status: DirectEditStatus) =>
    setDirectEditStatus(statusElement, status);
  const refresh = () => {
    setStatus(hasNativeInputChanges(inputs, initialValues) ? "dirty" : "clean");
  };

  inputs.forEach((input) => {
    input.addEventListener("input", refresh);
    input.addEventListener("change", refresh);
  });

  return {
    markSaved() {
      inputs.forEach((input) => {
        initialValues.set(input.id, input.value);
      });
      setStatus("saved");
    },
    refresh,
    setStatus,
  };
}

export function createNativeDirtyTrackerByIds(
  statusElementId: string,
  inputIds: readonly string[],
) {
  return createNativeDirtyTracker(
    document.getElementById(statusElementId) as HTMLElement | null,
    queryNativeValueInputs(inputIds),
  );
}

export function readEntityPickerId(input: HTMLInputElement | null) {
  if (!input) return Number.NaN;
  const hashId = input.value.match(/#(\d+)\s*$/)?.[1];
  const directId = input.value.match(/^\s*(\d+)\s*$/)?.[1];
  return Number(hashId || directId || input.dataset.entityId || Number.NaN);
}

export function readNativeEntityPickerId(id: string) {
  return readEntityPickerId(getNativeInput(id));
}

export function readIdList(input: HTMLInputElement | null) {
  if (!input) return [];
  return input.value
    .split(/[\s,;]+/)
    .map((value) => Number(value.trim()))
    .filter(
      (value, index, values) =>
        Number.isFinite(value) && value > 0 && values.indexOf(value) === index,
    );
}

export function readNativeIdList(id: string) {
  return readIdList(getNativeInput(id));
}

export function readLineList(input: HTMLTextAreaElement | null) {
  if (!input) return [];
  return input.value
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
}

export function readNativeLineList(id: string) {
  return readLineList(getNativeTextArea(id));
}
