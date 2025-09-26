"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, MessageSquare, Clock, User } from "lucide-react"

export function BottomNav({ active }: { active?: "explore" | "messages" | "history" | "profile" }) {
  const pathname = usePathname()
  const isActive = (tab: typeof active, href: string) => {
    if (active) return active === tab
    return pathname === href
  }

  const Item = ({
    href,
    label,
    icon: Icon,
    tab,
  }: {
    href: string
    label: string
    icon: any
    tab: "explore" | "messages" | "history" | "profile"
  }) => (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 rounded-md ${
        isActive(tab, href) ? "text-foreground" : "text-(--muted-foreground)"
      }`}
      aria-current={isActive(tab, href) ? "page" : undefined}
    >
      <Icon size={20} />
      <span className="text-[11px]">{label}</span>
    </Link>
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-(--border) bg-(--card)">
      <div className="mx-auto max-w-4xl px-4 py-1.5 flex items-center gap-2">
        <Item href="/assistant/explore" label="Explore" icon={Home} tab="explore" />
        <Item href="/assistant/chat" label="Messages" icon={MessageSquare} tab="messages" />
        <Item href="/assistant/history" label="History" icon={Clock} tab="history" />
        <Item href="/assistant/profile" label="Profile" icon={User} tab="profile" />
      </div>
    </nav>
  )
}
