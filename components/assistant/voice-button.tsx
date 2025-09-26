"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"

export function VoiceButton({
  onTranscript,
  disabled,
}: {
  onTranscript: (text: string) => void
  disabled?: boolean
}) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) {
      const rec = new SR()
      rec.lang = "en-US"
      rec.continuous = false
      rec.interimResults = false
      rec.maxAlternatives = 1
      rec.onresult = (event: any) => {
        const t = event.results?.[0]?.[0]?.transcript
        if (t) onTranscript(t)
      }
      rec.onerror = () => setListening(false)
      rec.onend = () => setListening(false)
      recognitionRef.current = rec
    }
  }, [onTranscript])

  const toggle = async () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.")
      return
    }
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
      return
    }
    // Ask for mic permission via getUserMedia to surface the prompt
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      // ignore; user may have previously granted/denied
    }
    recognitionRef.current.start()
    setListening(true)
  }

  return (
    <Button
      type="button"
      variant={listening ? "default" : "outline"}
      onClick={toggle}
      disabled={disabled}
      className={listening ? "bg-(--accent) text-(--background)" : "border-(--border)"}
      aria-pressed={listening}
      aria-label={listening ? "Stop voice input" : "Start voice input"}
      title={listening ? "Stop voice input" : "Start voice input"}
    >
      {listening ? "Listening…" : "Voice"}
    </Button>
  )
}
