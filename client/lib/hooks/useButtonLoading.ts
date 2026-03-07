import { useState, useCallback } from "react";

interface UseButtonLoadingOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  duration?: number;
}

export function useButtonLoading(options: UseButtonLoadingOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAsync = useCallback(
    async (asyncFn: () => Promise<any>): Promise<void> => {
      try {
        setIsLoading(true);
        await asyncFn();
        
        // Keep loading state for minimum duration for better UX
        if (options.duration) {
          await new Promise((resolve) =>
            setTimeout(resolve, options.duration)
          );
        }

        setIsLoading(false);
        options.onSuccess?.();
      } catch (error) {
        setIsLoading(false);
        const err = error instanceof Error ? error : new Error(String(error));
        options.onError?.(err);
        throw err;
      }
    },
    [options]
  );

  const startLoading = useCallback(() => setIsLoading(true), []);
  const stopLoading = useCallback(() => setIsLoading(false), []);

  return {
    isLoading,
    handleAsync,
    startLoading,
    stopLoading,
  };
}
