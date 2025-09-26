import { createBrowserClient } from "@supabase/ssr"

declare global {
  // eslint-disable-next-line no-var
  var __supabaseBrowser__: ReturnType<typeof createBrowserClient> | undefined
}

export function getSupabaseBrowser() {
  if (!globalThis.__supabaseBrowser__) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !anon) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars")
    }
    globalThis.__supabaseBrowser__ = createBrowserClient(url, anon)
  }
  return globalThis.__supabaseBrowser__
}
