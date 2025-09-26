export default async function run() {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "Sample Chat",
      messages: [
        { role: "user", content: "Hello!" },
        { role: "assistant", content: "Hi there, how can I help?" },
      ],
    }),
  })
  const data = await res.json()
  console.log("[v0] Save sample response:", data)
}
