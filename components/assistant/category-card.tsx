"use client"

import { Card } from "@/components/ui/card"

export function CategoryCard({
  label,
  desc,
  Icon,
}: {
  label: string
  desc: string
  Icon: any
}) {
  return (
    <Card className="p-3 bg-(--card) border-(--border) rounded-xl shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_14%,transparent)]">
      <div className="flex items-start justify-between">
        <div className="w-9 h-9 rounded-lg bg-(--bubble-bg) border border-(--border) flex items-center justify-center">
          <Icon size={18} />
        </div>
      </div>
      <div className="mt-3">
        <div className="font-medium">{label}</div>
        <div className="text-xs text-(--muted-foreground) leading-relaxed">{desc}</div>
      </div>
    </Card>
  )
}
