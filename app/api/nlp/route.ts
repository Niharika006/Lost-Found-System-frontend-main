import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { generateObject } from "ai"
import { groq } from "@ai-sdk/groq"

const Schema = z.object({
  intent: z.enum(["lost", "found", "unknown"]),
  category: z.enum(["person", "item", "other"]),
  language: z.string().optional(),
  name: z.string().optional(),
  age: z.number().int().min(0).max(120).optional(),
  description: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const { transcript, language } = await req.json()
    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "Missing transcript" }, { status: 400 })
    }

    const { object } = await generateObject({
      model: groq("llama-3.1-70b-versatile"),
      schema: Schema,
      system:
        "Extract structured data from multilingual text about lost or found persons/items. Be concise and safe. Infer intent (lost/found). If unsure, use unknown.",
      prompt: `Language hint: ${language || "auto"}\nText:\n${transcript}`,
    })

    return NextResponse.json({ result: object })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "NLP error" }, { status: 500 })
  }
}
