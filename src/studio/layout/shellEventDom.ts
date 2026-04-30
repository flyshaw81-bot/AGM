type NumberInputBinding = {
  onChange: (value: number) => void;
  committedValues: WeakMap<HTMLInputElement, string>;
};

const numberInputBindings = new Map<string, NumberInputBinding>();
const directlyBoundNumberInputs = new WeakSet<HTMLInputElement>();
let delegatedNumberInputEventsBound = false;

function readInitialNumberInputValue(input: HTMLInputElement) {
  return input.defaultValue ?? input.value;
}

function commitNumberInput(input: HTMLInputElement) {
  const binding = numberInputBindings.get(input.id);
  if (!binding) return;

  const value = Number(input.value);
  if (!Number.isFinite(value)) return;

  const lastCommittedValue =
    binding.committedValues.get(input) ?? readInitialNumberInputValue(input);
  if (input.value === lastCommittedValue) return;

  binding.committedValues.set(input, input.value);
  binding.onChange(value);
}

function bindNumberInputElement(input: HTMLInputElement) {
  if (directlyBoundNumberInputs.has(input)) return;

  directlyBoundNumberInputs.add(input);
  numberInputBindings.get(input.id)?.committedValues.set(input, input.value);
  input.addEventListener("input", () => commitNumberInput(input));
  input.addEventListener("change", () => commitNumberInput(input));
}

function bindDelegatedNumberInputEvents() {
  if (delegatedNumberInputEventsBound || !document.addEventListener) return;
  delegatedNumberInputEventsBound = true;

  const commitFromEvent = (event: Event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    commitNumberInput(event.target);
  };

  document.addEventListener("input", commitFromEvent);
  document.addEventListener("change", commitFromEvent);
}

export function bindNumberInput(id: string, onChange: (value: number) => void) {
  const input = document.getElementById(id) as HTMLInputElement | null;
  const binding = numberInputBindings.get(id) || {
    onChange,
    committedValues: new WeakMap<HTMLInputElement, string>(),
  };
  binding.onChange = onChange;
  numberInputBindings.set(id, binding);

  if (input) bindNumberInputElement(input);
  bindDelegatedNumberInputEvents();
}
