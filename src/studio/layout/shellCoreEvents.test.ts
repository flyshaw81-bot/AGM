import { describe, expect, it } from "vitest";
import { shouldDismissNativeEditorDrawerClick } from "./shellCoreEvents";

function makeTarget(selectors: string[]) {
  return {
    closest(selector: string) {
      return selectors.includes(selector) ? ({} as Element) : null;
    },
  } as unknown as EventTarget;
}

describe("native editor outside dismiss", () => {
  it("dismisses the editor drawer when clicking the native app outside protected controls", () => {
    expect(
      shouldDismissNativeEditorDrawerClick(
        { section: "editors" },
        makeTarget([".studio-native-app"]),
      ),
    ).toBe(true);
  });

  it("keeps the v8 fixed editor panel open when clicking the map or blank workspace", () => {
    expect(
      shouldDismissNativeEditorDrawerClick(
        { section: "editors" },
        makeTarget([".studio-native-app", ".studio-native-app--v8"]),
      ),
    ).toBe(false);
  });

  it("keeps the editor drawer open for clicks inside the drawer", () => {
    expect(
      shouldDismissNativeEditorDrawerClick(
        { section: "editors" },
        makeTarget([".studio-native-app", ".studio-native-drawer"]),
      ),
    ).toBe(false);
  });

  it.each([
    ".studio-native-iconbar",
    ".studio-native-v8-info-panel",
    ".studio-native-topbar",
    ".studio-floating-toolbar",
    ".studio-native-layerbar",
    ".studio-native-v8-bottom",
    ".studio-map-zoom",
    ".studio-native-biome-popover",
  ])("keeps the editor drawer open for %s clicks", (selector) => {
    expect(
      shouldDismissNativeEditorDrawerClick(
        { section: "editors" },
        makeTarget([".studio-native-app", selector]),
      ),
    ).toBe(false);
  });

  it("ignores clicks when another section is active", () => {
    expect(
      shouldDismissNativeEditorDrawerClick(
        { section: "canvas" },
        makeTarget([".studio-native-app"]),
      ),
    ).toBe(false);
  });
});
