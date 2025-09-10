import { NextResponse } from "next/server"
import { createReport } from "@/app/actions/reports"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const items: any[] = Array.isArray(body?.items) ? body.items : []
    let ok = 0
    for (const it of items) {
      const payload: Record<string, any> = Object.fromEntries(it.payload || [])
      // map to createReport input
      const input = {
        type: (payload.type as "lost" | "found") || "lost",
        title: String(payload.title || ""),
        description: String(payload.description || ""),
        category: String(payload.category || ""),
        language: String(payload.language || "English"),
        contact: String(payload.contact || ""),
        location_text: String(payload.location_text || ""),
        lat: payload.lat ? Number(payload.lat) : undefined,
        lng: payload.lng ? Number(payload.lng) : undefined,
        photo: null,
      }
      const res = await createReport(input as any)
      if (res.ok) ok++
    }
    return NextResponse.json({ ok, total: items.length })
  } catch (e) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 })
  }
}
