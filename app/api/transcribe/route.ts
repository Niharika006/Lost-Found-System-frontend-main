import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const audio = form.get("audio") as File | null
    const language = (form.get("language") as string | null) || "auto"
    if (!audio) return NextResponse.json({ error: "Missing audio" }, { status: 400 })

    const upstream = new FormData()
    upstream.append("file", audio, audio.name || "speech.webm")
    upstream.append("model", "whisper-large-v3")
    // Groq/OpenAI-compatible param; "auto" means omit to let model detect
    if (language && language !== "auto") upstream.append("language", language)

    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY || ""}`,
      },
      body: upstream,
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: "Upstream error", detail: text }, { status: 500 })
    }
    const data = await res.json()
    return NextResponse.json({ text: data.text ?? "" })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Transcription error" }, { status: 500 })
  }
}
