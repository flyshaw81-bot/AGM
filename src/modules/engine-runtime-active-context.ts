import type { EngineRuntimeContext } from "./engine-runtime-context";

const ACTIVE_CONTEXT_KEY = "__agmActiveEngineRuntimeContext";

type RuntimeWithActiveContext = typeof globalThis & {
  [ACTIVE_CONTEXT_KEY]?: EngineRuntimeContext;
};

export function setActiveEngineRuntimeContext(context: EngineRuntimeContext) {
  try {
    (globalThis as RuntimeWithActiveContext)[ACTIVE_CONTEXT_KEY] = context;
  } catch {
    // Non-browser tests can provide explicit contexts; the browser slot is optional.
  }
}

export function getActiveEngineRuntimeContext():
  | EngineRuntimeContext
  | undefined {
  try {
    return (globalThis as RuntimeWithActiveContext)[ACTIVE_CONTEXT_KEY];
  } catch {
    return undefined;
  }
}

export function clearActiveEngineRuntimeContext() {
  try {
    delete (globalThis as RuntimeWithActiveContext)[ACTIVE_CONTEXT_KEY];
  } catch {
    // Non-browser tests can provide explicit contexts; the browser slot is optional.
  }
}
