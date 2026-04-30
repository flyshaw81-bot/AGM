export type EngineRandomService = {
  next: () => number;
};

export function createGlobalRandomService(): EngineRandomService {
  return {
    next: () => Math.random(),
  };
}
