export type StudioUiVariant = "v8";

function getGlobalSearch() {
  const locationLike = (
    globalThis as typeof globalThis & {
      location?: { search?: string };
    }
  ).location;
  return locationLike?.search ?? "";
}

export function resolveStudioUiVariant(
  _search = getGlobalSearch(),
): StudioUiVariant {
  return "v8";
}

export function applyStudioUiVariant(
  root: HTMLElement,
  variant: StudioUiVariant = resolveStudioUiVariant(),
) {
  root.dataset.studioUi = variant;
}
