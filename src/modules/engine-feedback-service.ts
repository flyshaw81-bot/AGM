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
      getGlobalFunction<
        (message: string, isSuccess?: boolean, type?: any) => void
      >("tip")?.(message, isSuccess, type);
    },
  };
}

export function createGlobalFeedbackService(
  targets: EngineFeedbackServiceTargets = createGlobalFeedbackTargets(),
): EngineFeedbackService {
  return createEngineFeedbackService(targets);
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
