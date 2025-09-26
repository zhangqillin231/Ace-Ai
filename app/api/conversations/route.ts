import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

type IncomingMessage = { role: "system" | "user" | "assistant"; content: string; created_at?: string; metadata?: any }
type IncomingBody = { title?: string; messages: IncomingMessage[]; metadata?: any }

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as IncomingBody
    if (!body?.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Create conversation
    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .insert({
        title: body.title ?? (body.messages[0]?.content?.slice(0, 80) || "Conversation"),
        metadata: body.metadata ?? null,
      })
      .select("id")
      .single()

    if (convErr || !conv?.id) {
      return NextResponse.json({ error: convErr?.message || "Failed to create conversation" }, { status: 500 })
    }

    // Bulk insert messages
    const rows = body.messages.map((m) => ({
      conversation_id: conv.id,
      role: m.role,
      content: m.content,
      created_at: m.created_at ?? new Date().toISOString(),
      metadata: m.metadata ?? null,
    }))

    const { error: msgErr } = await supabase.from("messages").insert(rows)
    if (msgErr) {
      return NextResponse.json({ error: msgErr.message }, { status: 500 })
    }

    return NextResponse.json({ conversationId: conv.id }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}
