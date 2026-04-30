import { describe, expect, it } from "vitest";
import { createNativeDirtyTracker } from "./directEditorDom";
import { createFakeControl } from "./testDomHelpers";

describe("native editor DOM helpers", () => {
  it("tracks dirty and saved state for native editor inputs", () => {
    const input = createFakeControl("name", "Northwatch");
    const status = {
      dataset: {
        cleanLabel: "Clean",
        dirtyLabel: "Dirty",
        savedLabel: "Saved",
      },
      textContent: "",
    } as unknown as HTMLElement;

    const tracker = createNativeDirtyTracker(status, [
      input as unknown as HTMLInputElement,
    ]);

    input.value = "Southwatch";
    input.emit("input");

    expect(status.dataset.status).toBe("dirty");
    expect(status.textContent).toBe("Dirty");

    tracker.markSaved();

    expect(status.dataset.status).toBe("saved");
    expect(status.textContent).toBe("Saved");

    tracker.refresh();

    expect(status.dataset.status).toBe("clean");
    expect(status.textContent).toBe("Clean");
  });
});
