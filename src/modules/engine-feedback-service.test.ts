import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngineFeedbackService,
  createGlobalFeedbackService,
  createGlobalFeedbackTargets,
} from "./engine-feedback-service";

const originalTip = globalThis.tip;
const originalTipDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "tip",
);

describe("createGlobalFeedbackService", () => {
  afterEach(() => {
    if (originalTipDescriptor) {
      Object.defineProperty(globalThis, "tip", originalTipDescriptor);
    } else {
      Object.defineProperty(globalThis, "tip", {
        configurable: true,
        value: originalTip,
        writable: true,
      });
    }
  });

  it("routes runtime toast feedback through the current tip adapter", () => {
    globalThis.tip = vi.fn();

    createGlobalFeedbackTargets().showToast("Saved", true, "success");

    expect(globalThis.tip).toHaveBeenCalledWith("Saved", true, "success");
  });

  it("keeps global feedback service safe when tip is absent", () => {
    globalThis.tip = undefined as unknown as typeof globalThis.tip;

    expect(() =>
      createGlobalFeedbackService().showToast("Saved", true, "success"),
    ).not.toThrow();
  });

  it("keeps global feedback service safe when tip access throws", () => {
    Object.defineProperty(globalThis, "tip", {
      configurable: true,
      get: () => {
        throw new Error("tip blocked");
      },
    });

    expect(() =>
      createGlobalFeedbackService().showToast("Saved", true, "success"),
    ).not.toThrow();
  });

  it("composes feedback service from injected targets", () => {
    const showToast = vi.fn();

    createEngineFeedbackService({ showToast }).showToast(
      "Saved",
      true,
      "success",
    );

    expect(showToast).toHaveBeenCalledWith("Saved", true, "success");
  });

  it("creates a global feedback service from explicit targets", () => {
    const targets = {
      showToast: vi.fn(),
    };

    createGlobalFeedbackService(targets).showToast("Saved", true, "success");

    expect(targets.showToast).toHaveBeenCalledWith("Saved", true, "success");
  });
});
