"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from "ai"
import { useChat } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { VoiceButton } from "@/components/assistant/voice-button"
import { ImagePicker } from "@/components/assistant/image-picker"
import { MessageBubbles } from "@/components/assistant/message-bubbles"
import { PermissionCenter } from "@/components/assistant/permission-center"
import { SettingsDrawer } from "@/components/assistant/settings-drawer"
import "../theme.css"
import { useToast } from "@/hooks/use-toast"
import { Send, Square, Save, Shield, Loader2 } from "lucide-react"

export default function AssistantPage() {
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [persona, setPersona] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("assistant_persona") || "" : "",
  )
  const [automationAllowed, setAutomationAllowed] = useState<boolean>(() =>
    typeof window !== "undefined" ? localStorage.getItem("assistant_automation") === "true" : false,
  )
  const [apiError, setApiError] = useState<string | null>(null)
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch("/api/assistant", { method: "GET" })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          if (!cancelled) setApiError(data?.error || "Assistant API unavailable")
        } else {
          if (!cancelled) setApiError(null)
        }
      } catch (err: any) {
        if (!cancelled) setApiError("Network error contacting Assistant API")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  // Persist settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("assistant_persona", persona)
      localStorage.setItem("assistant_automation", String(automationAllowed))
    }
  }, [persona, automationAllowed])

  const { messages, sendMessage, addToolResult, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/assistant" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      // Safe web-executable example: openUrl
      if (toolCall.toolName === "openUrl") {
        // We don't auto-execute; UI will show a confirmation card below.
        // If you needed to auto-execute after confirmation, you'd call window.open(url, '_blank')
      }
    },
  })

  // TTS read-out for the latest assistant message if enabled
  const lastAssistantText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i]
      if (m.role === "assistant") {
        const textParts = m.parts?.filter((p) => p.type === "text") as Array<{ type: "text"; text: string }>
        return textParts?.map((p) => p.text).join("\n") || ""
      }
    }
    return ""
  }, [messages])

  const previousSpokenRef = useRef<string>("")
  useEffect(() => {
    if (!ttsEnabled) return
    if (!lastAssistantText || lastAssistantText === previousSpokenRef.current) return

    const utter = new SpeechSynthesisUtterance(lastAssistantText)
    utter.rate = 1.0
    utter.pitch = 1.0
    utter.lang = "en-US"
    speechSynthesis.cancel()
    speechSynthesis.speak(utter)
    previousSpokenRef.current = lastAssistantText

    return () => {
      speechSynthesis.cancel()
    }
  }, [lastAssistantText, ttsEnabled])

  // Submit text
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const text = String(fd.get("message") || "").trim()
    if (!text) return
    sendMessage({
      parts: [persona ? { type: "text", text: `System persona: ${persona}\nUser: ${text}` } : { type: "text", text }],
    })
    ;(e.currentTarget as any).reset()
  }

  // Send image + optional prompt
  const onSendImage = (fileDataUrl: string, mediaType: string, filename: string, prompt?: string) => {
    const parts: any[] = []
    if (prompt?.trim()) parts.push({ type: "text", text: prompt.trim() })
    parts.push({
      type: "file",
      data: fileDataUrl,
      mediaType,
      filename,
    })
    sendMessage({ parts })
  }

  async function saveConversation() {
    try {
      setSaving(true)
      // Convert UI messages to simple rows: { role, content }
      const simple = messages.map((m) => {
        const textParts = (m.parts?.filter((p) => p.type === "text") as Array<{ type: "text"; text: string }>) || []
        const content = textParts.map((p) => p.text).join("\n")
        const role = m.role === "user" || m.role === "assistant" || m.role === "system" ? m.role : "user"
        return { role, content }
      })
      const title =
        simple.find((m) => m.role === "user")?.content?.slice(0, 80) ||
        simple[0]?.content?.slice(0, 80) ||
        "Conversation"

      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, messages: simple }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Failed to save")
      }
      toast({ title: "Saved", description: `Conversation saved (id: ${data.conversationId}).` })
    } catch (err: any) {
      toast({ title: "Save failed", description: err?.message || "Unexpected error", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-[100svh] bg-background text-foreground">
      {apiError && (
        <div className="bg-(--accent) text-(--accent-foreground)">
          <div className="mx-auto max-w-4xl px-4 py-2 text-sm">
            {apiError}. Add OPENAI_API_KEY in Project Settings → Environment Variables (and on Vercel after publishing),
            then reload.
          </div>
        </div>
      )}
      <header className="border-b border-(--border) bg-(--card)">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full ring-2 ring-(--primary) shadow-[0_0_24px_var(--primary)]" aria-hidden />
            <div className="flex flex-col">
              <h1
                className="text-balance text-lg md:text-xl font-semibold tracking-wide"
                style={{ letterSpacing: "0.02em" }}
              >
                Ace AI
              </h1>
              <p className="text-sm text-(--muted-foreground)">Voice. Vision. Actions—with confirmation.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-(--muted-foreground)">TTS</span>
              <Switch checked={ttsEnabled} onCheckedChange={setTtsEnabled} aria-label="Toggle text-to-speech" />
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-(--border) hover:bg-(--muted) bg-transparent"
                  aria-label="Permissions"
                >
                  <Shield className="size-4" />
                  <span className="sr-only">Permissions</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-(--card) border-l border-(--border) text-foreground">
                <SheetHeader>
                  <SheetTitle>Permission Center</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <PermissionCenter />
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="outline"
              onClick={saveConversation}
              disabled={saving || messages.length === 0}
              className="border-(--border) hover:bg-(--muted) bg-transparent"
              aria-label="Save conversation"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              <span className="sr-only">{saving ? "Saving..." : "Save"}</span>
            </Button>

            <SettingsDrawer
              persona={persona}
              onPersonaChange={setPersona}
              automationAllowed={automationAllowed}
              onAutomationChange={setAutomationAllowed}
            />
          </div>
        </div>
      </header>

      <div className="neon-stage mx-auto max-w-4xl px-4">
        <div className="neon-wave" aria-hidden />
      </div>

      <section className="mx-auto max-w-4xl px-4 pb-24 pt-6">
        <Card className="bg-(--card) border-(--border)">
          <CardContent className="p-0">
            <div className="h-[70svh] flex flex-col">
              <div className="flex-1 overflow-y-auto p-4">
                <MessageBubbles
                  messages={messages}
                  onConfirmTool={(toolCallId, payload) => {
                    addToolResult({
                      tool: payload.tool,
                      toolCallId,
                      output: payload.output,
                    })
                    if (payload.tool === "openUrl" && typeof payload.output === "string") {
                      try {
                        const parsed = JSON.parse(payload.output) as { url: string }
                        if (automationAllowed && parsed.url) window.open(parsed.url, "_blank", "noopener,noreferrer")
                      } catch {
                        // swallow JSON parse issues
                      }
                    }
                  }}
                />
              </div>

              <form onSubmit={onSubmit} className="border-t border-(--border) p-3">
                <div className="flex items-end gap-2">
                  <ImagePicker onPicked={onSendImage} />
                  <div className="flex-1">
                    <Input
                      name="message"
                      placeholder="Ask me to draft, plan, search, or propose an action..."
                      className="bg-transparent border-(--border) focus-visible:ring-(--primary)"
                      disabled={status === "in_progress"}
                    />
                  </div>
                  <VoiceButton
                    onTranscript={(transcript) => {
                      if (!transcript.trim()) return
                      sendMessage({
                        parts: [
                          persona
                            ? { type: "text", text: `System persona: ${persona}\nUser (voice): ${transcript}` }
                            : { type: "text", text: transcript },
                        ],
                      })
                    }}
                    disabled={status === "in_progress"}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="bg-(--primary) text-(--primary-foreground) hover:opacity-90"
                    aria-label="Send message"
                  >
                    <Send className="size-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                  {status === "in_progress" && (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => stop()}
                      className="border-(--border)"
                      aria-label="Stop response"
                    >
                      <Square className="size-4" />
                      <span className="sr-only">Stop</span>
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </CardContent>
        </Card>

        <p className="mt-3 text-xs text-(--muted-foreground)">
          For system/OS-level automations, this web MVP only proposes safe, confirmable actions. Native helpers will
          enable deeper control later.
        </p>
      </section>
    </main>
  )
}
