/**
 * Client-side auth utilities for Nhost.
 */

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

export async function getAuthToken(): Promise<string | null> {
  // In Nhost v4, we manage the session via cookies for universal compatibility
  return getCookie("sb_access_token");
}

export type StoredUser = {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "CONSUMER" | "IMPORTER" | "EXPORTER" | "SUPPLIER" | "ADMIN";
} & Record<string, unknown>;

