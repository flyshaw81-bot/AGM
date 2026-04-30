import { describe, expect, it } from "vitest";
import { OceanModule } from "./ocean-layers";

describe("OceanModule", () => {
  it("can be imported without browser globals", () => {
    expect(OceanModule).toBeTypeOf("function");
  });
});
