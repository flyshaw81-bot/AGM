export type EngineLogService = {
  warn: (message: string) => void;
  error: (message: string) => void;
};

export function createGlobalLogService(): EngineLogService {
  return {
    warn: (message) => {
      globalThis.WARN && console.warn(message);
    },
    error: (message) => {
      globalThis.ERROR && console.error(message);
    },
  };
}
