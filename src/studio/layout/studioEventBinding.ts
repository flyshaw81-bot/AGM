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
    button.addEventListener("click", () => handler(button));
  });
}

export function bindInputValue(
  id: string,
  handler: (value: string, input: HTMLInputElement) => void,
) {
  const input = document.getElementById(id) as HTMLInputElement | null;
  if (!input) return;
  input.addEventListener("input", () => handler(input.value, input));
}

export function bindFileInput(id: string, handler: (file: File) => void) {
  const input = document.getElementById(id) as HTMLInputElement | null;
  if (!input) return;
  input.addEventListener("change", () => {
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
  select.addEventListener("change", () => handler(select.value as T, select));
}
