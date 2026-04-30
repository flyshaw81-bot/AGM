import { describe, expect, it, vi } from "vitest";

import {
  createGlobalStudioThemeSyncTargets,
  createStudioThemeSyncTargets,
} from "./studioThemeSyncTargets";

describe("studioThemeSyncTargets", () => {
  it("composes theme sync targets from injected document adapters", () => {
    const targets = {
      setDocumentTheme: vi.fn(),
    };

    expect(createStudioThemeSyncTargets(targets)).toBe(targets);
  });

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
