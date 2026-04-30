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

export function createGlobalFeedbackService(): EngineFeedbackService {
  return createEngineFeedbackService({
    showToast: (message, isSuccess, type) => {
      tip(message, isSuccess, type as any);
    },
  });
}
