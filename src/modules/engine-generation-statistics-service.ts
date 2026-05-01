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

export function createGlobalGenerationStatisticsTargets(): EngineGenerationStatisticsTargets {
  return {
    showStatistics: (heightmapTemplateId) => {
      globalThis.showStatistics?.(heightmapTemplateId);
    },
  };
}

export function createGlobalGenerationStatisticsService(
  targets: EngineGenerationStatisticsTargets = createGlobalGenerationStatisticsTargets(),
): EngineGenerationStatisticsService {
  return createGenerationStatisticsService(targets);
}
