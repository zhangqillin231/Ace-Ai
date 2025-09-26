"use client"

import type { UIMessage } from "ai"

type ToolPayload =
  | { tool: "openUrl"; output: string } // JSON string: { "url": "https://..." }
  | { tool: "composeEmail"; output: string } // JSON string summary
  | { tool: "scheduleEvent"; output: string } // JSON string summary
  | { tool: "adjustVolume"; output: string } // JSON string summary
  | { tool: "askForConfirmation"; output: string }

export function MessageBubbles({
  messages,
  onConfirmTool,
}: {
  messages: UIMessage[]
  onConfirmTool: (toolCallId: string, payload: ToolPayload) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      {messages.map((m) => (
        <div key={m.id} className={m.role === "user" ? "self-end" : "self-start"}>
          <div className="bubble-caption">{m.role}</div>
          <Bubble message={m} onConfirmTool={onConfirmTool} />
        </div>
      ))}
    </div>
  )
}

function Bubble({
  message,
  onConfirmTool,
}: {
  message: UIMessage
  onConfirmTool: (toolCallId: string, payload: ToolPayload) => void
}) {
  return (
    <div className={`bubble ${message.role === "user" ? "bubble-user" : "bubble-assistant"}`}>
      <div className="space-y-2">
        {message.parts?.map((p, idx) => {
          if (p.type === "text") {
            return (
              <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                {p.text}
              </div>
            )
          }
          if (p.type === "file") {
            if (typeof p.data === "string" && (p.mediaType?.startsWith("image/") ?? false)) {
              return (
                <img
                  key={idx}
                  src={p.data || "/placeholder.svg?height=256&width=256&query=attached%20image%20preview"}
                  alt="Attachment"
                  className="rounded-md border border-(--border) max-h-64"
                />
              )
            }
            return (
              <div key={idx} className="text-xs text-(--muted-foreground)">
                File: {p.filename || "attachment"} ({p.mediaType || "unknown"})
              </div>
            )
          }

          // Tool parts rendering: show confirmation UI for input-available, then show outputs
          // We will check for names we defined in our API (openUrl, composeEmail, scheduleEvent, adjustVolume, askForConfirmation)
          if (p.type?.startsWith?.("tool-")) {
            // Render states gracefully
            // @ts-expect-error - generic tool part type union at runtime
            const state = p.state
            // @ts-expect-error
            const toolName: string = p.type.replace("tool-", "")
            if (state === "input-available") {
              return (
                <div key={idx} className="text-(--muted-foreground) flex flex-col gap-2">
                  <div className="text-sm">
                    {toolName === "openUrl" && "Assistant wants to open a URL."}
                    {toolName === "composeEmail" && "Assistant wants to compose an email draft."}
                    {toolName === "scheduleEvent" && "Assistant wants to propose a calendar event."}
                    {toolName === "adjustVolume" && "Assistant wants to adjust system volume."}
                    {toolName === "askForConfirmation" && "Assistant requests your confirmation."}
                  </div>
                  {/* @ts-expect-error */}
                  {p.input ? (
                    <pre className="text-xs bg-(--muted) rounded p-2 overflow-auto">
                      {JSON.stringify(p.input, null, 2)}
                    </pre>
                  ) : null}
                  <div className="flex items-center gap-2">
                    <button
                      className="tool-action primary"
                      onClick={() => {
                        const output = p.input ? JSON.stringify(p.input) : "confirmed"
                        onConfirmTool(p.toolCallId, { tool: toolName as any, output })
                      }}
                    >
                      Confirm
                    </button>
                    <button
                      className="tool-action"
                      onClick={() => {
                        onConfirmTool(p.toolCallId, { tool: "askForConfirmation", output: "denied" })
                      }}
                    >
                      Deny
                    </button>
                  </div>
                </div>
              )
            }
            if (state === "output-available") {
              // @ts-expect-error
              const out = p.output
              return (
                <div key={idx} className="text-xs text-(--muted-foreground)">
                  Tool result: {typeof out === "string" ? out : JSON.stringify(out)}
                </div>
              )
            }
            if (state === "input-streaming") {
              return (
                <div key={idx} className="text-xs text-(--muted-foreground)">
                  Preparing action…
                </div>
              )
            }
            if (state === "output-error") {
              // @ts-expect-error
              return (
                <div key={idx} className="text-xs text-(--accent)">
                  Tool error: {p.errorText}
                </div>
              )
            }
          }

          return (
            <div key={idx} className="text-xs text-(--muted-foreground)">
              Unsupported content
            </div>
          )
        })}
      </div>
    </div>
  )
}
