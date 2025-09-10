"use client"

import { useEffect, useRef, useState } from "react"
import { Mic, Square, Languages, Wand2, Megaphone } from "lucide-react"
import { AISpeech } from "@/components/ai-speech"

type LangOpt = { label: string; code: string; note?: string }

const LANGS: LangOpt[] = [
  { label: "Hindi", code: "hi-IN" },
  { label: "Marathi", code: "mr-IN" },
  { label: "Bengali", code: "bn-IN" },
  { label: "Tamil", code: "ta-IN" },
  // Bhojpuri may not be supported by Web Speech on all devices; we fallback to Hindi TTS, recognition tries "bho"
  { label: "Bhojpuri", code: "bho", note: "Falls back to Hindi if unsupported" },
]

export function KioskVoice() {
  const [lang, setLang] = useState<LangOpt>(LANGS[0])
  const [mode, setMode] = useState<"lost" | "found">("lost")
  const [supported, setSupported] = useState<boolean>(false)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [transcript, setTranscript] = useState<string>("")
  const [error, setError] = useState<string>("")

  const recognitionRef = useRef<any | null>(null)

  useEffect(() => {
    // Detect Web Speech API
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setSupported(Boolean(SR))
    if (SR) {
      const rec = new SR()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = lang.code === "bho" ? "hi-IN" : lang.code // Bhojpuri fallback to Hindi model for better accuracy
      rec.onresult = (event: any) => {
        let text = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          text += event.results[i][0].transcript
        }
        setTranscript((prev) => (text.length > prev.length ? text : prev))
      }
      rec.onerror = (e: any) => {
        setError(e?.message || "Voice recognition error")
        setIsRecording(false)
      }
      recognitionRef.current = rec
    }
    return () => {
      try {
        recognitionRef.current?.stop?.()
      } catch {}
    }
  }, [lang])

  const start = () => {
    setError("")
    if (!recognitionRef.current) {
      setError("Voice recognition not supported on this device")
      return
    }
    // update language in case user changed it
    recognitionRef.current.lang = lang.code === "bho" ? "hi-IN" : lang.code
    try {
      recognitionRef.current.start()
      setIsRecording(true)
    } catch (e: any) {
      setError(e?.message || "Could not start")
    }
  }

  const stop = () => {
    try {
      recognitionRef.current?.stop?.()
    } catch {}
    setIsRecording(false)
  }

  const clearAll = () => {
    setTranscript("")
    setError("")
  }

  const openPrefilled = () => {
    const qs = transcript ? `?desc=${encodeURIComponent(transcript)}` : ""
    const href = mode === "lost" ? `/lost${qs}` : `/found${qs}`
    window.location.href = href
  }

  return (
    <section aria-labelledby="speak-to-loft" className="w-full rounded-lg border bg-background p-4">
      <div className="mb-3 flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-blue-600" aria-hidden="true" />
        <h2 id="speak-to-loft" className="text-lg font-semibold text-pretty">
          Lost? Speak to LOFT
        </h2>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4" aria-hidden="true" />
          <label htmlFor="lang" className="sr-only">
            Language
          </label>
          <select
            id="lang"
            className="w-full rounded-md border bg-background p-2"
            value={lang.code}
            onChange={(e) => {
              const next = LANGS.find((l) => l.code === e.target.value) || LANGS[0]
              setLang(next)
            }}
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-start gap-2">
          <span className="text-sm text-muted-foreground">Report type:</span>
          <button
            type="button"
            onClick={() => setMode("lost")}
            className={`rounded-md px-3 py-2 text-sm ${mode === "lost" ? "bg-blue-600 text-white" : "border"}`}
            aria-pressed={mode === "lost"}
          >
            I Lost Something
          </button>
          <button
            type="button"
            onClick={() => setMode("found")}
            className={`rounded-md px-3 py-2 text-sm ${mode === "found" ? "bg-emerald-600 text-white" : "border"}`}
            aria-pressed={mode === "found"}
          >
            I Found Something
          </button>
        </div>
      </div>

      {!supported && (
        <p className="mb-3 text-sm text-amber-600">
          This device browser does not support voice recognition. You can still use the large buttons above.
        </p>
      )}

      <div className="mb-4 flex items-center gap-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={start}
            className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Mic className="h-5 w-5" aria-hidden="true" />
            Start speaking
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <Square className="h-5 w-5" aria-hidden="true" />
            Stop
          </button>
        )}

        <button type="button" onClick={clearAll} className="rounded-md border px-3 py-2 text-sm">
          Clear
        </button>

        {transcript && <AISpeech text={transcript} lang={lang.code === "bho" ? "hi-IN" : lang.code} />}
      </div>

      <div className="mb-3 rounded-md bg-muted p-3">
        <label className="mb-1 block text-sm font-medium">Transcript</label>
        <p className="min-h-12 whitespace-pre-wrap text-sm">
          {transcript || "Tap Start speaking and describe your situation in your language."}
        </p>
      </div>

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={openPrefilled}
          className="rounded-md bg-emerald-600 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          disabled={!transcript}
          aria-disabled={!transcript}
        >
          Open {mode === "lost" ? "Lost" : "Found"} form with transcript
        </button>

        <button
          type="button"
          onClick={() => {
            if (!transcript) return
            navigator.clipboard?.writeText(transcript).catch(() => {})
          }}
          className="rounded-md border px-3 py-2 text-sm"
          disabled={!transcript}
          aria-disabled={!transcript}
        >
          Copy transcript
        </button>

        <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
          <Wand2 className="h-4 w-4" aria-hidden="true" />
          <span>
            Tip: Say details like name, age, clothes, location. Example: {'"'}Mera beta kho gaya hai, 8 saal, lal shirt,
            Bhakt Niwas ke paas.{'"'}
          </span>
        </div>
      </div>

      {lang.note && (
        <p className="mt-2 text-xs text-muted-foreground">
          Note: {lang.label} recognition support varies by device. {lang.note}
        </p>
      )}
    </section>
  )
}

export default KioskVoice
