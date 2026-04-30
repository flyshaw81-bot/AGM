import { describe, expect, it, vi } from "vitest";
import { injectStudioStyles, type StudioStyleTargets } from "./styles";

function createTargets(existing = false) {
  const style = {
    id: "",
    textContent: "",
  } as HTMLStyleElement;
  const targets: StudioStyleTargets = {
    getStyleElement: vi.fn(() =>
      existing ? ({ id: "studioShellStyles" } as HTMLElement) : null,
    ),
    createStyleElement: vi.fn(() => style),
    appendToHead: vi.fn(),
  };
  return { style, targets };
}

describe("injectStudioStyles", () => {
  it("injects composed Studio styles through injected document targets", () => {
    const { style, targets } = createTargets();

    injectStudioStyles(targets);

    expect(targets.getStyleElement).toHaveBeenCalledWith("studioShellStyles");
    expect(targets.createStyleElement).toHaveBeenCalled();
    expect(style.id).toBe("studioShellStyles");
    expect(style.textContent).toContain("body.studio-enabled");
    expect(style.textContent).toContain("#studioRoot");
    expect(targets.appendToHead).toHaveBeenCalledWith(style);
  });

  it("does not create duplicate style elements", () => {
    const { targets } = createTargets(true);

    injectStudioStyles(targets);

    expect(targets.createStyleElement).not.toHaveBeenCalled();
    expect(targets.appendToHead).not.toHaveBeenCalled();
  });
});
