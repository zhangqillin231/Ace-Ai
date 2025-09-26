"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function PermissionCenter() {
  const [mic, setMic] = useState<"unknown" | "granted" | "denied">("unknown")
  const [camera, setCamera] = useState<"unknown" | "granted" | "denied">("unknown")

  useEffect(() => {
    let canceled = false
    ;(async () => {
      try {
        // Not all browsers support navigator.permissions; guard usage
        const perms = (navigator as any).permissions
        if (perms?.query) {
          const micStatus = await perms.query({ name: "microphone" as PermissionName }).catch(() => null)
          const camStatus = await perms.query({ name: "camera" as PermissionName }).catch(() => null)
          if (!canceled) {
            if (micStatus) micStatus.onchange = () => setMic(micStatus.state as any)
            if (camStatus) camStatus.onchange = () => setCamera(camStatus.state as any)
            if (micStatus) setMic(micStatus.state as any)
            if (camStatus) setCamera(camStatus.state as any)
          }
        }
      } catch {
        // ignore
      }
    })()
    return () => {
      canceled = true
    }
  }, [])

  const requestMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setMic("granted")
    } catch {
      setMic("denied")
    }
  }

  const requestCamera = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
      setCamera("granted")
    } catch {
      setCamera("denied")
    }
  }

  const Pill = ({ label, state }: { label: string; state: string }) => (
    <span className="text-xs px-2 py-1 rounded-full border border-(--border) bg-(--muted)">
      {label}: {state}
    </span>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Pill label="Microphone" state={mic} />
        <Button variant="outline" onClick={requestMic} className="border-(--border) bg-transparent">
          Request
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Pill label="Camera" state={camera} />
        <Button variant="outline" onClick={requestCamera} className="border-(--border) bg-transparent">
          Request
        </Button>
      </div>
      <p className="text-sm text-(--muted-foreground)">
        Permissions are only requested when you use voice or camera features, and are never used without your consent.
      </p>
    </div>
  )
}
