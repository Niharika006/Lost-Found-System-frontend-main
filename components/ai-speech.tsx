"use client"
import React from "react"
import { Volume2, Square, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  text: string
  lang?: string // "hi-IN", "mr-IN", "bn-IN", "ta-IN", "en-IN"
  className?: string
}

export function AISpeech({ text, lang = "hi-IN", className }: Props) {
  const [speaking, setSpeaking] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  function speak() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return
    setLoading(true)
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = lang
    utter.onend = () => {
      setSpeaking(false)
      setLoading(false)
    }
    utter.onerror = () => {
      setSpeaking(false)
      setLoading(false)
    }
    setSpeaking(true)
    window.speechSynthesis.speak(utter)
  }

  function stop() {
    if (!("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }

  return (
    <div className={className}>
      {!speaking && !loading ? (
        <Button type="button" variant="outline" size="sm" onClick={speak} aria-label="Play audio">
          <Volume2 className="h-4 w-4 mr-2" /> Listen
        </Button>
      ) : loading ? (
        <Button type="button" variant="secondary" size="sm" disabled>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Preparing...
        </Button>
      ) : (
        <Button type="button" variant="destructive" size="sm" onClick={stop} aria-label="Stop audio">
          <Square className="h-4 w-4 mr-2" /> Stop
        </Button>
      )}
    </div>
  )
}
