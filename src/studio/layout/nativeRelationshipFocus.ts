const directRelationshipFieldInputIds: Record<
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

function getWindow(): Window | undefined {
  try {
    return globalThis.window;
  } catch {
    return undefined;
  }
}

function getDocument(): Document | undefined {
  try {
    return globalThis.document;
  } catch {
    return undefined;
  }
}

export function getDirectRelationshipFieldInputId(
  entity: string,
  field: string,
) {
  return directRelationshipFieldInputIds[entity]?.[field] || null;
}

export function focusDirectRelationshipField(fieldId: string) {
  try {
    const schedule = getWindow()?.setTimeout ?? globalThis.setTimeout;
    schedule(() => {
      try {
        const input = getDocument()?.getElementById(fieldId) as
          | HTMLInputElement
          | null
          | undefined;
        if (!input) return;
        input.focus();
        input.select();
        input.scrollIntoView({ block: "center", behavior: "smooth" });
      } catch {
        // Relationship focus is best-effort after direct editor navigation.
      }
    }, 0);
  } catch {
    // Restricted runtimes may block scheduling or browser globals.
  }
}

export const nativeRelationshipFieldInputIds = directRelationshipFieldInputIds;
export const getNativeRelationshipFieldInputId =
  getDirectRelationshipFieldInputId;
export const focusNativeRelationshipField = focusDirectRelationshipField;
