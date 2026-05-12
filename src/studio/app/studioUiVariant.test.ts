import { describe, expect, it } from "vitest";
import {
  applyStudioUiVariant,
  resolveStudioUiVariant,
} from "./studioUiVariant";

describe("studio UI variant", () => {
  it("uses v8 as the official UI variant regardless of legacy query flags", () => {
    expect(resolveStudioUiVariant("")).toBe("v8");
    expect(resolveStudioUiVariant("?theme=night")).toBe("v8");
    expect(resolveStudioUiVariant("?ui=current")).toBe("v8");
    expect(resolveStudioUiVariant("?ui=v8")).toBe("v8");
  });

  it("always applies the v8 root dataset", () => {
    const root = { dataset: {} } as HTMLElement;

    applyStudioUiVariant(root);

    expect(root.dataset.studioUi).toBe("v8");
  });
});
