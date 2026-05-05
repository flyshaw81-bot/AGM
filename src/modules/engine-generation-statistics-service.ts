export type EngineGenerationStatisticsService = {
  showStatistics: (heightmapTemplateId: string | undefined) => void;
};

export type EngineGenerationStatisticsTargets =
  EngineGenerationStatisticsService;

export function createGenerationStatisticsService(
  targets: EngineGenerationStatisticsTargets,
): EngineGenerationStatisticsService {
  return {
    showStatistics: (heightmapTemplateId) => {
      targets.showStatistics(heightmapTemplateId);
    },
  };
}

function getGlobalFunction<T extends (...args: never[]) => unknown>(
  name: string,
): T | undefined {
  try {
    const value = (globalThis as Record<string, unknown>)[name];
    return typeof value === "function" ? (value as T) : undefined;
  } catch {
    return undefined;
  }
}

export function createGlobalGenerationStatisticsTargets(): EngineGenerationStatisticsTargets {
  return {
    showStatistics: (heightmapTemplateId) => {
      getGlobalFunction<(heightmapTemplateId: string | undefined) => void>(
        "showStatistics",
      )?.(heightmapTemplateId);
    },
  };
}

export function createGlobalGenerationStatisticsService(
  targets: EngineGenerationStatisticsTargets = createGlobalGenerationStatisticsTargets(),
): EngineGenerationStatisticsService {
  return createGenerationStatisticsService(targets);
}
