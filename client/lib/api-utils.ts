import { nhost } from "./nhost";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Makes an authenticated fetch request to an API endpoint.
 * Automatically includes the Nhost access token as a Bearer token.
 * Includes basic retry logic for 5xx errors or network failures.
 */
export async function authFetch<T = unknown>(
  url: string,
  options: RequestInit = {},
  retries = 3,
  backoffMs = 500
): Promise<T> {
  // Securely get the token from memory/localStorage rather than HTTP-Only cookies
  const session = nhost.getUserSession();
  const token = session?.accessToken || null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let lastError: Error | unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers,
        credentials: "include", // Ensure HttpOnly cookies are strictly sent
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));

        // Don't retry client errors (4xx) except 429 Too Many Requests
        if (res.status >= 400 && res.status < 500 && res.status !== 429) {
          throw new Error(errorData.error || `API request failed with status ${res.status}`);
        }

        throw new Error(`API error ${res.status}: ${errorData.error || "Unknown error"}`);
      }

      return res.json();
    } catch (e) {
      lastError = e;
      // If it's the last attempt or a strict client error (like 401/403/404), throw immediately
      if (attempt === retries - 1 || (e instanceof Error && e.message.includes("failed with status 4"))) {
        break;
      }
      // Wait before retrying (exponential backoff)
      await delay(backoffMs * Math.pow(2, attempt));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("API request failed after retries");
}

/** Format a number into shortened form like $1.2M, $45K etc */
export function formatCurrency(n: number, decimals = 0): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(decimals)}K`;
  return `$${n.toFixed(decimals)}`;
}

/** Format a number with commas */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/** Get relative time string */
export function timeAgo(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Get initials from a name */
export function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Format a date object or string into a standard readable format */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}
