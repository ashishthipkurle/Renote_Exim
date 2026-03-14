import { useCallback } from "react";
import { authFetch as baseAuthFetch } from "@/lib/api-utils";

/**
 * React hook wrapper for authFetch.
 * Returns a stable reference to the authFetch function for use in components and useEffects.
 */
export function useAuthFetch() {
  const fetcher = useCallback(async <T = unknown>(url: string, options?: RequestInit): Promise<T> => {
    return baseAuthFetch<T>(url, options);
  }, []);

  return fetcher;
}
