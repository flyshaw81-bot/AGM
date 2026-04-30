export type EngineFeedbackService = {
  showToast: (message: string, isSuccess?: boolean, type?: string) => void;
};

export function createGlobalFeedbackService(): EngineFeedbackService {
  return {
    showToast: (message, isSuccess, type) => {
      tip(message, isSuccess, type as any);
    },
  };
}
