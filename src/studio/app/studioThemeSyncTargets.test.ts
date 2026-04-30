import { describe, expect, it } from "vitest";

import { createGlobalStudioThemeSyncTargets } from "./studioThemeSyncTargets";

describe("studioThemeSyncTargets", () => {
  it("composes default document theme adapter", () => {
    const originalDocument = globalThis.document;
    globalThis.document = {
      documentElement: {
        dataset: {},
      },
    } as unknown as Document;

    try {
      createGlobalStudioThemeSyncTargets().setDocumentTheme("night");

      expect(document.documentElement.dataset.studioTheme).toBe("night");
    } finally {
      globalThis.document = originalDocument;
    }
  });
});
