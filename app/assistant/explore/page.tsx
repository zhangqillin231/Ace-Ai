"use client"

import Link from "next/link"
import { useMemo } from "react"
import "../theme.css"
import { BottomNav } from "@/components/assistant/bottom-nav"
import { CategoryCard } from "@/components/assistant/category-card"
import { Code, CalendarClock, GraduationCap, Languages, LampDesk, ShoppingCart, Info, FileText } from "lucide-react"

export default function ExplorePage() {
  const categories = useMemo(
    () => [
      { key: "coding", label: "Coding", desc: "Write code & fix bugs", icon: Code, q: "Help me write or review code." },
      {
        key: "scheduling",
        label: "Scheduling",
        desc: "Plan your day",
        icon: CalendarClock,
        q: "Propose a daily schedule for tomorrow with breaks.",
      },
      {
        key: "education",
        label: "Education",
        desc: "Explain & tutor",
        icon: GraduationCap,
        q: "Teach me a topic I choose, step by step.",
      },
      {
        key: "translation",
        label: "Translation",
        desc: "Translate precisely",
        icon: Languages,
        q: "Translate my text and explain nuances.",
      },
      { key: "ideas", label: "Ideas", desc: "Brainstorm fast", icon: LampDesk, q: "Brainstorm 10 creative ideas." },
      {
        key: "shopping",
        label: "Smart Shopping",
        desc: "Compare & choose",
        icon: ShoppingCart,
        q: "Compare products by features and price.",
      },
      {
        key: "info",
        label: "Information",
        desc: "Search & summarize",
        icon: Info,
        q: "Summarize the latest info on X.",
      },
      {
        key: "articles",
        label: "Articles",
        desc: "Outline & draft",
        icon: FileText,
        q: "Outline a concise article with headings.",
      },
    ],
    [],
  )

  return (
    <main className="min-h-[100svh] bg-background text-foreground">
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full ring-2 ring-(--primary) shadow-[0_0_24px_var(--primary)]" aria-hidden />
          <h1 className="text-lg font-semibold tracking-wide">Let's Explore</h1>
        </div>
        <Link
          href="/assistant/chat"
          className="text-sm text-(--muted-foreground) hover:text-foreground underline-offset-4 hover:underline"
        >
          Messages
        </Link>
      </header>

      <section className="px-4 pb-24">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((c) => (
            <Link key={c.key} href={`/assistant/chat?q=${encodeURIComponent(c.q)}`} className="block">
              <CategoryCard label={c.label} desc={c.desc} Icon={c.icon} />
            </Link>
          ))}
        </div>
      </section>

      <BottomNav active="explore" />
    </main>
  )
}
