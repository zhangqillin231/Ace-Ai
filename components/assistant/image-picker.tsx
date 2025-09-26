"use client"

import type React from "react"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ImagePicker({
  onPicked,
}: {
  onPicked: (dataUrl: string, mediaType: string, filename: string, prompt?: string) => void
}) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [prompt, setPrompt] = useState("")

  const pick = () => fileRef.current?.click()

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      onPicked(result, file.type || "image/png", file.name || "image.png", prompt)
      setPrompt("")
      if (fileRef.current) fileRef.current.value = ""
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex items-end gap-2">
      <div className="hidden">
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} />
      </div>
      <div className="hidden md:block w-40">
        <Input
          placeholder="Image prompt (optional)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="bg-transparent border-(--border) focus-visible:ring-(--primary)"
        />
      </div>
      <Button type="button" variant="outline" onClick={pick} className="border-(--border) bg-transparent">
        Add Image
      </Button>
    </div>
  )
}
