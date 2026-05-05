import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createEngineLogService,
  createGlobalLogService,
  createGlobalLogTargets,
} from "./engine-log-service";

const originalWarnFlag = globalThis.WARN;
const originalErrorFlag = globalThis.ERROR;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

describe("createGlobalLogService", () => {
  afterEach(() => {
    globalThis.WARN = originalWarnFlag;
    globalThis.ERROR = originalErrorFlag;
    console.warn = originalConsoleWarn;
    console.error = originalConsoleError;
  });

  it("respects runtime warning and error console gates", () => {
    console.warn = vi.fn();
    console.error = vi.fn();
    globalThis.WARN = true;
    globalThis.ERROR = true;

    const logs = createGlobalLogTargets();
    logs.warn("Careful");
    logs.error("Broken");

    expect(console.warn).toHaveBeenCalledWith("Careful");
    expect(console.error).toHaveBeenCalledWith("Broken");
  });

  it("does not log when runtime console gates are disabled", () => {
    console.warn = vi.fn();
    console.error = vi.fn();
    globalThis.WARN = false;
    globalThis.ERROR = false;

    const logs = createGlobalLogService();
    logs.warn("Hidden warning");
    logs.error("Hidden error");

    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it("composes log service from injected console targets", () => {
    const warn = vi.fn();
    const error = vi.fn();
    const logs = createEngineLogService({
      shouldWarn: () => true,
      shouldError: () => false,
      warn,
      error,
    });

    logs.warn("Visible");
    logs.error("Hidden");

    expect(warn).toHaveBeenCalledWith("Visible");
    expect(error).not.toHaveBeenCalled();
  });

  it("creates a global log service from explicit targets", () => {
    const warn = vi.fn();
    const error = vi.fn();
    const logs = createGlobalLogService({
      shouldWarn: () => true,
      shouldError: () => true,
      warn,
      error,
    });

    logs.warn("Careful");
    logs.error("Broken");

    expect(warn).toHaveBeenCalledWith("Careful");
    expect(error).toHaveBeenCalledWith("Broken");
  });
});
