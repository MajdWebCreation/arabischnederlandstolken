import "server-only";

/**
 * Supabase projects created after the 2025 API key migration label this key
 * "publishable key" in the dashboard; older projects still call it the
 * "anon" / "public" key. Both are the same kind of value (safe to use from
 * a browser, protected entirely by Row Level Security) and both work here -
 * accepting either env var name means setup works regardless of which
 * label this specific project's dashboard shows.
 */
function readPublishableKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = readPublishableKey();

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

export function hasSupabaseEnv() {
  return getSupabaseEnv() !== null;
}
