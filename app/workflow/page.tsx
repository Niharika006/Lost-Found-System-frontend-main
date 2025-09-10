"use client"

import { useState } from "react"
import Link from "next/link"

export default function WorkflowPage() {
  const [copied, setCopied] = useState(false)

  const bullets = `LOFT User Workflow (Mahakumbh)
1) Pre-Registration (Optional)
• QR wristbands/tags for kids, elderly, and bags
• Guardian details linked to QR for later scan

2) Reporting a Case
Lost: Kiosk/App/Volunteer → choose language → speak into mic or fill details → optional photo → submit
Found: Kiosk/App/Volunteer → photo or scan QR wristband → add brief description + location (Gate/Ghat) → submit

3) Matching (AI)
• Face recognition (people)
• Image similarity (items)
• Multilingual text similarity (NLP)
• Fused confidence score → candidate matches

4) Volunteer Review
• See pending reports → Run Match
• Match Card: photos, translated descriptions, confidence bar
• Actions: Confirm Reunited or Flag False Match

5) Notification & Guidance
• If confirmed: SMS/voice/app alert in preferred language
• Assigned Safe Zone (nearest reunification point)

6) Reunification
• Guardian shows code/QR at Safe Zone
• Volunteer verifies → handover → status becomes Resolved

7) Post-Event
• Auto-expire data unless consent was given
• Retrain models with feedback (false positives)`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bullets)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-balance">LOFT Workflow</h1>
        <p className="text-sm text-muted-foreground mt-2 text-pretty">
          End-to-end flow from report to reunification, designed for Mahakumbh scale and multilingual access.
        </p>
      </header>

      <section className="rounded-lg border bg-card text-card-foreground p-4">
        <img
          src="/images/loft-workflow.png"
          alt="Flowchart: QR pre-registration, Report Lost/Found, AI Match, Volunteer Review, Notification & Safe Zone, Reunification, Post-Event"
          className="w-full h-auto rounded-md"
        />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="/images/loft-workflow.png"
            download
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
          >
            Download PNG (PPT-ready)
          </a>
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 hover:bg-accent"
              aria-live="polite"
            >
              {copied ? "Copied!" : "Copy Slide Bullets"}
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 hover:bg-accent"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Why this works for Mahakumbh</h2>
        <ul className="mt-3 list-disc pl-5 space-y-1">
          <li>Multiple entry points: kiosk, app, volunteer, QR scan</li>
          <li>Multilingual voice removes literacy barrier</li>
          <li>Offline-first with sync for poor connectivity</li>
          <li>Safe Zones and announcements reduce crowd chaos</li>
          <li>Consent + auto-delete protect privacy</li>
        </ul>
      </section>
    </main>
  )
}
