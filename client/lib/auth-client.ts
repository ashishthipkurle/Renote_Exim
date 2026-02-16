import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export async function getAuthToken(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export type StoredUser = {
  id: string;
  name: string | null;
  email: string;
  role: "EXPORTER" | "IMPORTER" | "ADMIN";
} & Record<string, unknown>;

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}
