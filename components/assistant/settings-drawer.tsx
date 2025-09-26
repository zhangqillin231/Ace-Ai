"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useId } from "react"

export function SettingsDrawer({
  persona,
  onPersonaChange,
  automationAllowed,
  onAutomationChange,
}: {
  persona: string
  onPersonaChange: (v: string) => void
  automationAllowed: boolean
  onAutomationChange: (v: boolean) => void
}) {
  const id = useId()
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="border-(--border) hover:bg-(--muted) bg-transparent">
          Settings
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-(--card) border-l border-(--border) text-foreground">
        <SheetHeader>
          <SheetTitle>Assistant Settings</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-6">
          <div>
            <Label htmlFor={`${id}-persona`}>Persona (system style)</Label>
            <Textarea
              id={`${id}-persona`}
              value={persona}
              onChange={(e) => onPersonaChange(e.target.value)}
              placeholder="e.g., Be concise, futuristic guide with friendly tone."
              className="mt-2 bg-transparent border-(--border) focus-visible:ring-(--primary)"
            />
            <p className="text-xs text-(--muted-foreground) mt-1">
              Optional. This will be prepended to your messages as context.
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Trusted automations</div>
              <p className="text-xs text-(--muted-foreground)">
                Allow auto-opening safe actions (like URLs) after confirming.
              </p>
            </div>
            <Switch checked={automationAllowed} onCheckedChange={onAutomationChange} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
