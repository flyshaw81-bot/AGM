export function normalizeWorkbenchQuery(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function matchesWorkbenchQuery(
  query: string,
  values: Array<number | string | null | undefined>,
) {
  if (!query) return true;
  return values
    .filter(
      (value): value is number | string =>
        value !== null && value !== undefined && value !== "",
    )
    .some((value) => String(value).toLocaleLowerCase().includes(query));
}

export function selectVisibleWorkbenchItem<T extends { id: number }>(
  filteredItems: T[],
  activeItems: T[],
  selectedId: number | null | undefined,
) {
  return (
    filteredItems.find((item) => item.id === selectedId) ||
    activeItems.find((item) => item.id === selectedId) ||
    filteredItems[0] ||
    activeItems[0]
  );
}
