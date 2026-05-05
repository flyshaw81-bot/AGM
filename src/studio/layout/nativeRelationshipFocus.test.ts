import { describe, expect, it } from "vitest";
import {
  focusDirectRelationshipField,
  getDirectRelationshipFieldInputId,
  getNativeRelationshipFieldInputId,
} from "./nativeRelationshipFocus";

describe("native relationship focus helpers", () => {
  it("maps relationship entities and fields to editor inputs", () => {
    expect(getDirectRelationshipFieldInputId("state", "capital")).toBe(
      "studioStateCapitalInput",
    );
    expect(getDirectRelationshipFieldInputId("state", "culture")).toBe(
      "studioStateCultureInput",
    );
    expect(getDirectRelationshipFieldInputId("burg", "state")).toBe(
      "studioBurgStateInput",
    );
    expect(getDirectRelationshipFieldInputId("burg", "culture")).toBe(
      "studioBurgCultureInput",
    );
    expect(getDirectRelationshipFieldInputId("province", "burg")).toBe(
      "studioProvinceBurgInput",
    );
    expect(getDirectRelationshipFieldInputId("province", "state")).toBe(
      "studioProvinceStateInput",
    );
  });

  it("returns null for unsupported relationship focus targets", () => {
    expect(getDirectRelationshipFieldInputId("route", "state")).toBeNull();
    expect(getDirectRelationshipFieldInputId("state", "neighbors")).toBeNull();
  });

  it("keeps the previous relationship focus helper as a compatibility alias", () => {
    expect(getNativeRelationshipFieldInputId("state", "capital")).toBe(
      "studioStateCapitalInput",
    );
  });

  it("keeps relationship field focus safe when browser globals throw", () => {
    const originalWindow = Object.getOwnPropertyDescriptor(
      globalThis,
      "window",
    );
    const originalDocument = Object.getOwnPropertyDescriptor(
      globalThis,
      "document",
    );
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      get: () => {
        throw new Error("window blocked");
      },
    });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      get: () => {
        throw new Error("document blocked");
      },
    });

    try {
      expect(() =>
        focusDirectRelationshipField("studioStateCapitalInput"),
      ).not.toThrow();
    } finally {
      if (originalWindow)
        Object.defineProperty(globalThis, "window", originalWindow);
      if (originalDocument)
        Object.defineProperty(globalThis, "document", originalDocument);
    }
  });
});
