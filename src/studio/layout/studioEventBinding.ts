const clickBindings = new WeakMap<HTMLElement, Map<string, EventListener>>();
const inputBindings = new WeakMap<
  HTMLInputElement,
  Map<string, EventListener>
>();
const selectBindings = new WeakMap<
  HTMLSelectElement,
  Map<string, EventListener>
>();

function replaceElementListener<T extends HTMLElement>(
  bindings: WeakMap<T, Map<string, EventListener>>,
  element: T,
  eventName: string,
  bindingKey: string,
  listener: EventListener,
) {
  let elementBindings = bindings.get(element);
  if (!elementBindings) {
    elementBindings = new Map();
    bindings.set(element, elementBindings);
  }

  const key = `${eventName}:${bindingKey}`;
  const previousListener = elementBindings.get(key);
  if (previousListener)
    element.removeEventListener(eventName, previousListener);

  element.addEventListener(eventName, listener);
  elementBindings.set(key, listener);
}

export function bindActionClick(
  action: string,
  handler: (button: HTMLElement) => void,
) {
  bindClickSelector(`[data-studio-action='${action}']`, handler);
}

export function bindClickSelector(
  selector: string,
  handler: (button: HTMLElement) => void,
) {
  document.querySelectorAll<HTMLElement>(selector).forEach((button) => {
    replaceElementListener(clickBindings, button, "click", selector, () =>
      handler(button),
    );
  });
}

export function bindInputValue(
  id: string,
  handler: (value: string, input: HTMLInputElement) => void,
) {
  const input = document.getElementById(id) as HTMLInputElement | null;
  if (!input) return;
  replaceElementListener(inputBindings, input, "input", id, () =>
    handler(input.value, input),
  );
}

export function bindFileInput(id: string, handler: (file: File) => void) {
  const input = document.getElementById(id) as HTMLInputElement | null;
  if (!input) return;
  replaceElementListener(inputBindings, input, "change", id, () => {
    const file = input.files?.[0];
    if (file) handler(file);
    input.value = "";
  });
}

export function bindSelectValue<T extends string>(
  id: string,
  handler: (value: T, select: HTMLSelectElement) => void,
) {
  const select = document.getElementById(id) as HTMLSelectElement | null;
  if (!select) return;
  replaceElementListener(selectBindings, select, "change", id, () =>
    handler(select.value as T, select),
  );
}
