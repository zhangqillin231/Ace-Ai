import { consumeStream, convertToModelMessages, streamText, tool, type UIMessage, validateUIMessages } from "ai"
import { z } from "zod"

export const maxDuration = 30

const openUrl = tool({
  description: "Propose opening a URL in a new tab. Always ask for confirmation first.",
  inputSchema: z.object({ url: z.string().url() }),
  // We don’t actually open anything on the server; we just acknowledge output
  async *execute(input) {
    yield { state: "ready" as const, ...input }
  },
})

const composeEmail = tool({
  description: "Propose composing an email draft. Always ask for confirmation first.",
  inputSchema: z.object({
    to: z.string().email().describe("Recipient email"),
    subject: z.string(),
    body: z.string(),
  }),
  async *execute(input) {
    yield { state: "ready" as const, ...input }
  },
})

const scheduleEvent = tool({
  description: "Propose creating a calendar event. Always ask for confirmation first.",
  inputSchema: z.object({
    title: z.string(),
    when: z.string().describe("ISO or natural language time"),
    durationMinutes: z.number().int().positive().optional(),
    location: z.string().optional(),
    attendees: z.array(z.string().email()).optional(),
  }),
  async *execute(input) {
    yield { state: "ready" as const, ...input }
  },
})

const adjustVolume = tool({
  description: "Propose adjusting system volume (0-100). Always ask for confirmation first.",
  inputSchema: z.object({ level: z.number().min(0).max(100) }),
  async *execute(input) {
    yield { state: "ready" as const, ...input }
  },
})

const askForConfirmation = tool({
  description: "Ask the user for confirmation for a sensitive step.",
  inputSchema: z.object({ message: z.string() }),
  async *execute(input) {
    yield { state: "ready" as const, message: input.message }
  },
})

const tools = { openUrl, composeEmail, scheduleEvent, adjustVolume, askForConfirmation } as const
type AssistantMessage = UIMessage<any, any, typeof tools>

// System behavioral guidance for the assistant
const systemPreamble = [
  {
    role: "system" as const,
    content: [
      {
        type: "text" as const,
        text: [
          "You are Ace AI: concise, helpful, explicitly safe.",
          "Rules:",
          "- Prefer proposing actions via tools with clear parameters.",
          "- Always require user confirmation before any action.",
          "- If an action cannot be done in the browser, still propose it as a safe suggestion with steps.",
          "- When analyzing images, describe what you see and extract useful info.",
          "- Keep answers short and to the point unless asked otherwise.",
        ].join("\n"),
      },
    ],
  },
]

export async function GET() {
  // Provide a quick health check for UI to detect missing provider keys
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  if (!hasOpenAI) {
    console.log("[v0] /api/assistant GET: missing OPENAI_API_KEY")
    return new Response(JSON.stringify({ ok: false, error: "Missing OPENAI_API_KEY" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    })
  }
  console.log("[v0] /api/assistant GET: ok")
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json" },
  })
}

export async function POST(req: Request) {
  const { messages } = (await req.json()) as { messages: AssistantMessage[] }
  const safeMessages = await validateUIMessages<AssistantMessage>({ messages, tools })

  const result = streamText({
    model: "openai/gpt-5-mini",
    messages: convertToModelMessages([...systemPreamble, ...safeMessages]),
    tools,
    abortSignal: req.signal,
    maxSteps: 6,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("[assistant] stream aborted")
      }
    },
    consumeSseStream: consumeStream,
  })
}
