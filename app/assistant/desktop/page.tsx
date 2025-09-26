"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import "./styles.css"

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
    mozSpeechRecognition: any
    msSpeechRecognition: any
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
  }
  interface SpeechRecognitionResultList extends Array<SpeechRecognitionResult> {
    item(index: number): SpeechRecognitionResult
  }
  interface SpeechRecognitionResult extends EventTarget {
    readonly transcript: string
    readonly confidence: number
  }
}

type SpeechRecognition = any

export default function DesktopVoicePage() {
  const [listening, setListening] = useState(false)
  const [support, setSupport] = useState<{ stt: boolean; tts: boolean }>({ stt: false, tts: false })
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Setup SpeechRecognition (Web Speech API)
  useEffect(() => {
    const SR: any =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition
    const stt = Boolean(SR)
    const tts = "speechSynthesis" in window
    setSupport({ stt, tts })

    if (stt) {
      const rec: SpeechRecognition = new SR()
      rec.continuous = false
      rec.lang = "en-US"
      rec.interimResults = true
      rec.maxAlternatives = 1

      rec.onresult = (e: SpeechRecognitionEvent) => {
        const last = e.results[e.results.length - 1]
        const transcript = last[0]?.transcript?.trim()
        // Mirror interim text into the prompt line for feedback
        const promptEl = document.getElementById("promptMirror")
        if (promptEl) promptEl.textContent = transcript || ""
      }

      rec.onerror = () => {
        setListening(false)
      }

      rec.onend = () => {
        setListening(false)
        const finalText = (document.getElementById("promptMirror")?.textContent || "").trim()
        if (finalText) {
          // Navigate to chat and pass the spoken text as the first prompt
          const q = encodeURIComponent(finalText)
          window.location.href = `/assistant/chat?q=${q}`
        }
      }

      recognitionRef.current = rec
    }
  }, [])

  const toggleMic = () => {
    if (!support.stt || !recognitionRef.current) return
    if (!listening) {
      try {
        recognitionRef.current.start()
        setListening(true)
      } catch {
        setListening(false)
      }
    } else {
      try {
        recognitionRef.current.stop()
      } catch {
        // ignore
      }
    }
  }

  return (
    <main className="desktop-voice-page bg-desk-background text-desk-foreground">
      <header className="desk-header">
        <div className="desk-left">
          <div className="live-dot" aria-hidden />
          <span className="text-xs/6 text-desk-muted">Live status</span>
        </div>
        <div className="desk-center">
          <div className="pill" aria-label="Latency">
            52 ms
          </div>
          <div className="pill">4.0</div>
          <div className="pill">A</div>
          <div className="pill">+</div>
        </div>
        <div className="desk-right">
          <Link href="/assistant/explore" className="pill-link">
            Explore
          </Link>
          <Link href="/assistant/chat" className="pill-link">
            Chat
          </Link>
        </div>
      </header>

      <section className="desk-hero">
        <h1 className="hero-title text-balance">
          <span className="hero-title-strong">AI Voice Trainer</span>
          <span className="hero-title-faint"> for Any Commercial Product</span>
        </h1>

        <WaveVisualizer />

        <p className="hero-prompt" aria-live="polite">
          How can I help you?
        </p>

        <button
          type="button"
          onClick={toggleMic}
          className={`mic-button ${listening ? "is-on" : ""}`}
          aria-pressed={listening}
          aria-label={listening ? "Stop listening" : "Start listening"}
        >
          <span className="mic-glow" />
          <span className="mic-dot" />
          {listening ? "Listening..." : "Tap to Speak"}
        </button>

        <div id="promptMirror" className="prompt-mirror" />

        <div className="quick-actions" role="group" aria-label="Quick actions">
          <button onClick={() => (window.location.href = "/assistant/chat?q=Order%20mozzarella")}>
            Order mozzarella
          </button>
          <button onClick={() => (window.location.href = "/assistant/chat?q=Make%20a%20demo%20call")}>
            Make demo call
          </button>
          <button onClick={() => (window.location.href = "/assistant/chat?q=Set%20a%20meeting%20tomorrow%2010am")}>
            Schedule
          </button>
        </div>
      </section>

      <footer className="desk-footer">
        <div className="capability">
          <span className="dot dot-green" />
          <span>Microphone</span>
          <span className="badge">{support.stt ? "OK" : "Unavailable"}</span>
        </div>
        <div className="capability">
          <span className="dot dot-purple" />
          <span>Automation</span>
          <span className="badge">Off</span>
        </div>
        <div className="capability">
          <span className="dot dot-magenta" />
          <span>Sound Devices</span>
          <span className="badge">Default</span>
        </div>
        <div className="capability">
          <span className="dot dot-gray" />
          <span>Volume</span>
          <span className="badge">—</span>
        </div>
      </footer>
    </main>
  )
}

function WaveVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: true })
    if (!ctx) return

    let frame = 0
    const DPR = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = Math.floor(rect.width * DPR)
      canvas.height = Math.floor(rect.height * DPR)
    }
    resize()
    const onResize = () => resize()
    window.addEventListener("resize", onResize)

    const draw = () => {
      if (!ctx) return
      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // background subtle glow
      const g = ctx.createLinearGradient(0, 0, w, 0)
      g.addColorStop(0, "rgba(168,85,247,0.08)") // purple
      g.addColorStop(0.5, "rgba(255,45,172,0.14)") // magenta
      g.addColorStop(1, "rgba(168,85,247,0.08)")
      ctx.fillStyle = g
      ctx.fillRect(0, 0, w, h)

      // animated wave bars
      const bars = 180
      const mid = h / 2
      const step = w / bars
      for (let i = 0; i < bars; i++) {
        const x = i * step + step * 0.5
        const phase = (i / bars) * Math.PI * 2
        const amp = Math.sin(phase + frame * 0.04)
        const height = Math.max(2, Math.abs(amp) * (h * 0.35))
        const y = mid - height / 2

        const barGrad = ctx.createLinearGradient(0, y, 0, y + height)
        barGrad.addColorStop(0, "rgba(255,45,172,0.9)")
        barGrad.addColorStop(1, "rgba(168,85,247,0.7)")
        ctx.fillStyle = barGrad
        const bw = Math.max(1, step * 0.55)
        ctx.fillRect(x - bw / 2, y, bw, height)
      }

      frame++
      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", onResize)
    }
  }, [])

  return <canvas className="wave-canvas" aria-hidden ref={canvasRef} />
}
