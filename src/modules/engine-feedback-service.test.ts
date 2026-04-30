import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngineFeedbackService,
  createGlobalFeedbackService,
} from "./engine-feedback-service";

const originalTip = globalThis.tip;

describe("createGlobalFeedbackService", () => {
  afterEach(() => {
    globalThis.tip = originalTip;
  });

  it("routes runtime toast feedback through the current tip adapter", () => {
    globalThis.tip = vi.fn();

    createGlobalFeedbackService().showToast("Saved", true, "success");

    expect(globalThis.tip).toHaveBeenCalledWith("Saved", true, "success");
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
});
