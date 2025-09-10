"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

type ParsedIntent = {
  intent: "lost" | "found" | "unknown"
  category: "person" | "item" | "other"
  language?: string
  name?: string
  age?: number
  description?: string
}

type Props = {
  onCreate?: (data: ParsedIntent & { transcript: string }) => Promise<void>
}

export default function VoiceAssistant({ onCreate }: Props) {
  const [recording, setRecording] = React.useState(false)
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder | null>(null)
  const [chunks, setChunks] = React.useState<BlobPart[]>([])
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null)
  const [language, setLanguage] = React.useState<string>("auto")
  const [transcript, setTranscript] = React.useState("")
  const [parsed, setParsed] = React.useState<ParsedIntent | null>(null)
  const [loading, setLoading] = React.useState(false)
  const { toast } = useToast()

  React.useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      const localChunks: BlobPart[] = []
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) localChunks.push(e.data)
      }
      mr.onstop = () => {
        setChunks(localChunks)
        const blob = new Blob(localChunks, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
      }
      mr.start()
      setMediaRecorder(mr)
      setRecording(true)
    } catch (e: any) {
      toast({
        title: "Microphone error",
        description: e?.message || "Could not access microphone",
        variant: "destructive",
      })
    }
  }

  function stopRecording() {
    mediaRecorder?.stop()
    mediaRecorder?.stream.getTracks().forEach((t) => t.stop())
    setRecording(false)
  }

  async function transcribe() {
    if (chunks.length === 0) {
      toast({ title: "No audio", description: "Please record a message first." })
      return
    }
    setLoading(true)
    try {
      const blob = new Blob(chunks, { type: "audio/webm" })
      const form = new FormData()
      form.append("audio", blob, "speech.webm")
      form.append("language", language) // "auto" allowed

      const res = await fetch("/api/transcribe", { method: "POST", body: form })
      if (!res.ok) throw new Error("Transcription failed")
      const data = await res.json()
      setTranscript(data.text || "")
      toast({ title: "Transcribed", description: "Please review the text and continue." })
    } catch (e: any) {
      toast({ title: "Transcription error", description: e?.message || "Please try again", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function extract() {
    if (!transcript.trim()) {
      toast({ title: "No text", description: "Transcription text is empty." })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/nlp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, language }),
      })
      if (!res.ok) throw new Error("Extraction failed")
      const data = (await res.json()) as { result: ParsedIntent }
      setParsed(data.result)
      toast({ title: "Details extracted", description: "Confirm and create report." })
    } catch (e: any) {
      toast({ title: "NLP error", description: e?.message || "Please try again", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function create() {
    if (!onCreate) return
    if (!parsed) {
      toast({ title: "Missing details", description: "Please extract details first." })
      return
    }
    setLoading(true)
    try {
      await onCreate({ ...parsed, transcript })
      toast({ title: "Report created", description: "Thank you. A volunteer will assist you." })
      setParsed(null)
      setTranscript("")
      setAudioUrl(null)
      setChunks([])
    } catch (e: any) {
      toast({ title: "Create failed", description: e?.message || "Please try again", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-xl mx-auto">
      <CardHeader>
        <CardTitle className="text-balance">Lost? Speak to LOFT</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Language</label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Auto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto Detect</SelectItem>
                <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                <SelectItem value="mr">Marathi (मराठी)</SelectItem>
                <SelectItem value="bho">Bhojpuri (भोजपुरी)</SelectItem>
                <SelectItem value="bn">Bengali (বাংলা)</SelectItem>
                <SelectItem value="ta">Tamil (தமிழ்)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            {!recording ? (
              <Button onClick={startRecording} className="w-full" aria-label="Start recording">
                Start Recording
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopRecording} className="w-full" aria-label="Stop recording">
                Stop
              </Button>
            )}
          </div>
        </div>

        {audioUrl && <audio controls src={audioUrl} className="w-full" aria-label="Recorded audio preview" />}

        <div className="flex gap-2">
          <Button onClick={transcribe} disabled={loading} className="flex-1">
            Transcribe
          </Button>
          <Button onClick={extract} disabled={loading || !transcript} variant="secondary" className="flex-1">
            Extract Details
          </Button>
        </div>

        <div>
          <label className="text-sm font-medium">Transcript</label>
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Transcribed text appears here…"
            className="min-h-[96px]"
          />
        </div>

        {parsed && (
          <div className="text-sm rounded-md border p-3 bg-muted">
            <div>
              <span className="font-medium">Intent:</span> {parsed.intent}
            </div>
            <div>
              <span className="font-medium">Category:</span> {parsed.category}
            </div>
            {parsed.name && (
              <div>
                <span className="font-medium">Name:</span> {parsed.name}
              </div>
            )}
            {typeof parsed.age === "number" && (
              <div>
                <span className="font-medium">Age:</span> {parsed.age}
              </div>
            )}
            {parsed.description && (
              <div>
                <span className="font-medium">Desc:</span> {parsed.description}
              </div>
            )}
          </div>
        )}

        <Button onClick={create} disabled={loading || !parsed} className="w-full">
          Create Report
        </Button>
      </CardContent>
    </Card>
  )
}
