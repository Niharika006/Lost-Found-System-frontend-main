// Uses browser SpeechRecognition if available, otherwise records and POSTs to /api/transcribe (Groq Whisper).
"use client"
import React from "react"
import { Mic, Square, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  onTranscript: (text: string) => void
  lang?: string // e.g. "hi-IN", "mr-IN", "bn-IN", "ta-IN", "en-IN"
  className?: string
}

export function VoiceDictation({ onTranscript, lang = "hi-IN", className }: Props) {
  const [rec, setRec] = React.useState<MediaRecorder | null>(null)
  const [isListening, setIsListening] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const chunks = React.useRef<Blob[]>([])
  const supportsWebSpeech =
    typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)

  async function startWebSpeech() {
    try {
      const SR: any = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      if (!SR) return false
      const recognition = new SR()
      recognition.lang = lang
      recognition.interimResults = false
      recognition.maxAlternatives = 1
      recognition.onresult = (e: any) => {
        const text = e.results?.[0]?.[0]?.transcript || ""
        onTranscript(text)
      }
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => setIsListening(false)
      setIsListening(true)
      recognition.start()
      return true
    } catch {
      setIsListening(false)
      return false
    }
  }

  async function startMediaRecorder() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" })
    chunks.current = []
    mr.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data)
    mr.onstop = async () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" })
      setIsLoading(true)
      try {
        const fd = new FormData()
        fd.append("file", blob, "audio.webm")
        fd.append("lang", lang)
        const res = await fetch("/api/transcribe", { method: "POST", body: fd })
        const data = await res.json()
        if (data?.text) onTranscript(data.text)
      } catch (e) {
        console.log("[v0] Transcribe error", e)
      } finally {
        setIsLoading(false)
      }
    }
    mr.start()
    setRec(mr)
    setIsListening(true)
  }

  async function handleStart() {
    if (supportsWebSpeech) {
      const ok = await startWebSpeech()
      if (!ok) await startMediaRecorder()
    } else {
      await startMediaRecorder()
    }
  }

  function handleStop() {
    if (rec) {
      rec.stop()
      rec.stream.getTracks().forEach((t) => t.stop())
      setRec(null)
    }
    setIsListening(false)
  }

  return (
    <div className={className}>
      {!isListening && !isLoading ? (
        <Button type="button" variant="outline" size="sm" onClick={handleStart} aria-label="Start voice dictation">
          <Mic className="h-4 w-4 mr-2" /> Speak
        </Button>
      ) : isLoading ? (
        <Button type="button" variant="secondary" size="sm" disabled>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...
        </Button>
      ) : (
        <Button type="button" variant="destructive" size="sm" onClick={handleStop} aria-label="Stop recording">
          <Square className="h-4 w-4 mr-2" /> Stop
        </Button>
      )}
    </div>
  )
}
