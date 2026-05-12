import { describe, expect, it } from "vitest";
import { studioIcon, studioMaterialSymbolIcon } from "./shellShared";

describe("studioIcon", () => {
  it("renders AGM icons as a lucide icon-font compatible glyph", () => {
    const icon = studioIcon("home", "agm-icon");

    expect(icon).toContain('class="agm-icon"');
    expect(icon).toContain('data-studio-icon="home"');
    expect(icon).toContain('data-studio-icon-font="lucide"');
    expect(icon).toContain('data-studio-icon-name="house"');
    expect(icon).toContain('data-studio-icon-set="pencil-lucide-icon-font"');
    expect(icon).toContain('viewBox="0 0 24 24"');
    expect(icon).toContain('fill="none"');
    expect(icon).toContain('stroke="currentColor"');
    expect(icon).toContain('stroke-linecap="round"');
    expect(icon).toContain('stroke-linejoin="round"');
    expect(icon).toContain('d="M15 21v-8');
  });

  it("keeps missing icon names on the shared fallback glyph", () => {
    const icon = studioIcon("missing-icon");

    expect(icon).toContain('data-studio-icon="scene"');
    expect(icon).toContain('data-studio-icon-name="sparkles"');
    expect(icon).toContain('data-studio-icon-set="pencil-lucide-icon-font"');
  });

  it("keeps layer-only icon names from falling back", () => {
    const icon = studioIcon("cloud-rain");

    expect(icon).toContain('data-studio-icon="cloud-rain"');
    expect(icon).toContain('data-studio-icon-name="cloud-rain"');
  });

  it("renders Pencil Material Symbols icon-font glyphs", () => {
    const icon = studioMaterialSymbolIcon("light_mode", "agm-topbar-icon");

    expect(icon).toContain('class="agm-topbar-icon"');
    expect(icon).toContain('data-studio-icon="light_mode"');
    expect(icon).toContain('data-studio-icon-font="Material Symbols Outlined"');
    expect(icon).toContain('data-studio-icon-name="light_mode"');
    expect(icon).toContain(
      'data-studio-icon-set="pencil-material-symbols-outlined"',
    );
    expect(icon).toContain(">light_mode</span>");
  });
});
