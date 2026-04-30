import { describe, expect, it, vi } from "vitest";
import {
  type StudioThemeSyncTargets,
  syncStudioDocumentTheme,
} from "./studioThemeSync";

describe("syncStudioDocumentTheme", () => {
  it("writes document theme through injected targets", () => {
    const targets: StudioThemeSyncTargets = {
      setDocumentTheme: vi.fn(),
    };

    syncStudioDocumentTheme("daylight", targets);

    expect(targets.setDocumentTheme).toHaveBeenCalledWith("daylight");
  });
});
