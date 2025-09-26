import { createClient } from "@supabase/supabase-js"

declare global {
  // eslint-disable-next-line no-var
  var __supabaseAdmin__: ReturnType<typeof createClient> | undefined
}

export function getSupabaseAdmin() {
  if (!globalThis.__supabaseAdmin__) {
    const url = process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceKey) {
      throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars")
    }
    globalThis.__supabaseAdmin__ = createClient(url, serviceKey, {
      auth: { persistSession: false },
    })
  }
  return globalThis.__supabaseAdmin__
}
