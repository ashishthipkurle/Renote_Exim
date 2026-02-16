export type SupabaseEnv = { url: string; anonKey: string };

export function tryGetSupabaseEnv(): SupabaseEnv | null {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.NEXT_SUPABASE_URL;

  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function getSupabaseEnv(): SupabaseEnv {
  const env = tryGetSupabaseEnv();
  if (!env) {
    throw new Error(
      "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (recommended), or SUPABASE_URL and SUPABASE_ANON_KEY for server-only usage."
    );
  }
  return env;
}
