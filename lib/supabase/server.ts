import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

declare global {
  // eslint-disable-next-line no-var
  var __supabaseServer__: ReturnType<typeof createServerClient> | undefined
}

export function getSupabaseServer() {
  const cookieStore = cookies()
  if (!globalThis.__supabaseServer__) {
    const url = process.env.SUPABASE_URL
    const anon = process.env.SUPABASE_ANON_KEY
    if (!url || !anon) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars")
    }
    globalThis.__supabaseServer__ = createServerClient(url, anon, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 })
        },
      },
    })
  }
  return globalThis.__supabaseServer__
}
