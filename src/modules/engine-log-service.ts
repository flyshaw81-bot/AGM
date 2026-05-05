export type EngineLogService = {
  warn: (message: string) => void;
  error: (message: string) => void;
};

export type EngineLogServiceTargets = {
  shouldWarn: () => boolean;
  shouldError: () => boolean;
  warn: (message: string) => void;
  error: (message: string) => void;
};

export function createEngineLogService(
  targets: EngineLogServiceTargets,
): EngineLogService {
  return {
    warn: (message) => {
      if (targets.shouldWarn()) targets.warn(message);
    },
    error: (message) => {
      if (targets.shouldError()) targets.error(message);
    },
  };
}

function getWarnFlag(): boolean {
  try {
    return Boolean(globalThis.WARN);
  } catch {
    return false;
  }
}

function getErrorFlag(): boolean {
  try {
    return Boolean(globalThis.ERROR);
  } catch {
    return false;
  }
}

export function createGlobalLogTargets(): EngineLogServiceTargets {
  return {
    shouldWarn: getWarnFlag,
    shouldError: getErrorFlag,
    warn: (message) => console.warn(message),
    error: (message) => console.error(message),
  };
}

export function createGlobalLogService(
  targets: EngineLogServiceTargets = createGlobalLogTargets(),
): EngineLogService {
  return createEngineLogService(targets);
}
