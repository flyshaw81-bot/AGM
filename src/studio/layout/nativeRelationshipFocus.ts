const nativeRelationshipFieldInputIds: Record<
  string,
  Record<string, string>
> = {
  state: {
    capital: "studioStateCapitalInput",
    culture: "studioStateCultureInput",
  },
  burg: {
    culture: "studioBurgCultureInput",
    state: "studioBurgStateInput",
  },
  province: {
    burg: "studioProvinceBurgInput",
    state: "studioProvinceStateInput",
  },
};

export function getNativeRelationshipFieldInputId(
  entity: string,
  field: string,
) {
  return nativeRelationshipFieldInputIds[entity]?.[field] || null;
}

export function focusNativeRelationshipField(fieldId: string) {
  window.setTimeout(() => {
    const input = document.getElementById(fieldId) as HTMLInputElement | null;
    if (!input) return;
    input.focus();
    input.select();
    input.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 0);
}
