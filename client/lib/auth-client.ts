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
  role: "USER" | "EXPORTER" | "IMPORTER" | "SUPPLIER" | "ADMIN";
} & Record<string, unknown>;

