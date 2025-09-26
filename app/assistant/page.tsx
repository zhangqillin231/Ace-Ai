"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import "./theme.css"

export default function OnboardingPage() {
  return (
    <main className="min-h-[100svh] bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between">
        <div className="size-8 rounded-full ring-2 ring-(--primary) shadow-[0_0_24px_var(--primary)]" aria-hidden />
        <Link
          href="/assistant/explore"
          className="text-sm text-(--muted-foreground) hover:text-foreground underline-offset-4 hover:underline"
        >
          Skip
        </Link>
      </header>

      <section className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="text-left w-full max-w-sm">
          <div className="text-sm text-(--muted-foreground)">Hi there</div>
          <h1 className="text-2xl font-semibold mt-1">Tap to chat</h1>
        </div>

        <button
          className="relative rounded-full h-40 w-40 bg-(--card) border border-(--border) shadow-[0_0_40px_color-mix(in_oklab,var(--primary)_25%,transparent)]"
          onClick={() => (window.location.href = "/assistant/chat")}
          aria-label="Start voice chat"
          title="Start voice chat"
        >
          <div
            className="absolute inset-0 rounded-full animate-pulse"
            style={{ boxShadow: "0 0 60px 6px color-mix(in oklab, var(--primary) 25%, transparent)" }}
            aria-hidden
          />
          <div className="h-full w-full flex items-center justify-center text-sm text-(--muted-foreground)">
            {"Tap to chat"}
          </div>
        </button>

        <div className="max-w-sm text-(--muted-foreground)">
          Welcome to Ace AI. Voice. Vision. Trusted actions—with confirmation.
        </div>

        <Link href="/assistant/explore" className="w-full max-w-sm">
          <Button className="w-full bg-(--primary) text-(--primary-foreground) hover:opacity-90">Get Started</Button>
        </Link>
      </section>
    </main>
  )
}
