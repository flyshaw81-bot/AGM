export type EngineFeedbackService = {
  showToast: (message: string, isSuccess?: boolean, type?: string) => void;
};

export type EngineFeedbackServiceTargets = {
  showToast: (message: string, isSuccess?: boolean, type?: string) => void;
};

export function createEngineFeedbackService(
  targets: EngineFeedbackServiceTargets,
): EngineFeedbackService {
  return {
    showToast: (message, isSuccess, type) => {
      targets.showToast(message, isSuccess, type);
    },
  };
}

export function createGlobalFeedbackTargets(): EngineFeedbackServiceTargets {
  return {
    showToast: (message, isSuccess, type) => {
      globalThis.tip?.(message, isSuccess, type as any);
    },
  };
}

export function createGlobalFeedbackService(
  targets: EngineFeedbackServiceTargets = createGlobalFeedbackTargets(),
): EngineFeedbackService {
  return createEngineFeedbackService(targets);
}
