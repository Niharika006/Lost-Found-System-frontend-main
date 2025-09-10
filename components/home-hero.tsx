"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { BadgeCheck, Mic, MapPin, QrCode, WifiOff, Users } from "lucide-react"
import Link from "next/link"

export function HomeHero() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 py-10 md:py-16">
      <div className="flex flex-col items-start gap-6 md:gap-8">
        <div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">Smart Lost & Found (LOFT)</h1>
          <p className="text-pretty mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            A simple, multilingual, offline-ready PWA to reunite people and belongings. Use voice in Hindi, Marathi,
            Bhojpuri, Bengali, Tamil and more. No typing needed.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
            <WifiOff className="h-4 w-4" aria-hidden />
            Offline PWA
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
            <Mic className="h-4 w-4" aria-hidden />
            Multilingual Voice
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
            <BadgeCheck className="h-4 w-4" aria-hidden />
            Volunteer-friendly
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/lost">Report Lost</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/found">Report Found</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/kiosk">Kiosk: Speak to LOFT</Link>
          </Button>
        </div>

        <div className="grid w-full gap-4 rounded-lg border p-4 md:grid-cols-3">
          <FeaturePill
            icon={<Mic className="h-5 w-5 text-blue-600" aria-hidden />}
            title="Speak to LOFT"
            desc="Say “Mera beta kho gaya hai” — we transcribe, understand, and file a report."
          />
          <FeaturePill
            icon={<MapPin className="h-5 w-5 text-blue-600" aria-hidden />}
            title="Photo + Location"
            desc="Capture a photo and current location for better matching accuracy."
          />
          <FeaturePill
            icon={<QrCode className="h-5 w-5 text-blue-600" aria-hidden />}
            title="QR Scan & Share"
            desc="Scan found tags and share report QR links for quick reunions."
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/browse">
              <Users className="h-4 w-4" aria-hidden /> Browse Nearby Reports
            </Link>
          </Button>
          <Button asChild variant="ghost" className="gap-2">
            <Link href="/scan">
              <QrCode className="h-4 w-4" aria-hidden /> Scan a QR
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

function FeaturePill({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  )
}
