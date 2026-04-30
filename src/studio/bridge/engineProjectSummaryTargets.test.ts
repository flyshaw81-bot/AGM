import { afterEach, describe, expect, it, vi } from "vitest";
import type { EngineProjectSummary } from "./engineActionTypes";
import type { EngineProjectFormTargets } from "./engineProjectFormTargets";
import {
  createGlobalProjectSummaryTargets,
  createProjectSummaryTargets,
} from "./engineProjectSummaryTargets";

type TestSummaryGlobal = typeof globalThis & {
  __studioProjectSummary?: EngineProjectSummary;
  ldb?: {
    get?: (key: string) => Promise<unknown>;
  };
};

const testGlobal = globalThis as TestSummaryGlobal;
const originalDocument = globalThis.document;
const originalLocalStorage = globalThis.localStorage;
const originalSessionStorage = globalThis.sessionStorage;
const originalSummary = testGlobal.__studioProjectSummary;
const originalLdb = testGlobal.ldb;

describe("createGlobalProjectSummaryTargets", () => {
  afterEach(() => {
    globalThis.document = originalDocument;
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalLocalStorage,
    });
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: originalSessionStorage,
    });
    testGlobal.__studioProjectSummary = originalSummary;
    testGlobal.ldb = originalLdb;
  });

  it("reads and writes the cached Studio project summary", () => {
    const targets = createGlobalProjectSummaryTargets();
    const summary = {
      pendingSeed: "abc",
    } as EngineProjectSummary;

    targets.setCachedSummary(summary);

    expect(targets.getCachedSummary()).toBe(summary);
  });

  it("reads storage, elements, and local database snapshots", async () => {
    const getLocalItem = vi.fn((key: string) =>
      key === "lastMap" ? "local-map" : null,
    );
    const getSessionItem = vi.fn((key: string) =>
      key === "lastMap" ? "session-map" : null,
    );
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: { getItem: getLocalItem },
    });
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: { getItem: getSessionItem },
    });
    globalThis.document = {
      getElementById: vi.fn((id) => (id === "optionsSeed" ? {} : null)),
    } as unknown as Document;
    testGlobal.ldb = {
      get: vi.fn(async () => ({ id: "lastMap" })),
    };

    const targets = createGlobalProjectSummaryTargets();

    expect(targets.getLocalStorageItem("lastMap")).toBe("local-map");
    expect(targets.getSessionStorageItem("lastMap")).toBe("session-map");
    expect(targets.hasElement("optionsSeed")).toBe(true);
    await expect(targets.readLocalDatabaseSnapshot()).resolves.toEqual({
      id: "lastMap",
    });
  });

  it("composes project summary targets from injected adapters", async () => {
    const summary = { pendingSeed: "abc" } as EngineProjectSummary;
    const setCachedSummary = vi.fn();
    const form = {} as EngineProjectFormTargets;
    const targets = createProjectSummaryTargets(
      form,
      {
        getCachedSummary: () => summary,
        setCachedSummary,
      },
      {
        getLocalStorageItem: (key) => (key === "lastMap" ? "local" : null),
        getSessionStorageItem: (key) => (key === "lastMap" ? "session" : null),
      },
      {
        hasElement: (id) => id === "optionsSeed",
      },
      {
        readLocalDatabaseSnapshot: async () => ({ id: "db" }),
      },
    );

    expect(targets.form).toBe(form);
    expect(targets.getCachedSummary()).toBe(summary);
    targets.setCachedSummary(summary);
    expect(setCachedSummary).toHaveBeenCalledWith(summary);
    expect(targets.getLocalStorageItem("lastMap")).toBe("local");
    expect(targets.getSessionStorageItem("lastMap")).toBe("session");
    expect(targets.hasElement("optionsSeed")).toBe(true);
    await expect(targets.readLocalDatabaseSnapshot()).resolves.toEqual({
      id: "db",
    });
  });
});
