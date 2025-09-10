"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Package, Users, Mic, MapPin, QrCode, WifiOff, ShieldCheck, Brain, Handshake } from "lucide-react"

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="text-center space-y-6">
        <h1 className="text-3xl md:text-5xl font-semibold text-balance">LOFT – Smart Lost & Found System</h1>
        <p className="text-lg md:text-xl text-pretty">
          A safe, accessible way to reunite people with their belongings during mega-events.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
          <Button
            asChild
            className="h-12 px-6 text-base md:text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Link href="/lost">
              <Search className="mr-2 h-5 w-5" /> Report Lost
            </Link>
          </Button>
          <Button
            asChild
            variant="secondary"
            className="h-12 px-6 text-base md:text-lg rounded-xl bg-gray-100 text-foreground hover:bg-gray-200"
          >
            <Link href="/found">
              <Package className="mr-2 h-5 w-5" /> Report Found
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-12 px-6 text-base md:text-lg rounded-xl bg-transparent">
            <Link href="/volunteer">
              <Users className="mr-2 h-5 w-5" /> Volunteer Dashboard
            </Link>
          </Button>
        </div>
      </section>

      <section className="mt-10 grid md:grid-cols-3 gap-4">
        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Problem</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Large crowds cause lost items and separation. Manual matching is slow and error-prone.</p>
          </CardContent>
        </Card>
        <Card className="rounded-xl shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Solution</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              LOFT captures Lost/Found reports with photos and languages, then assists volunteers with quick, confident
              matches.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-balance">What makes LOFT different?</h2>
        <p className="mt-2 text-muted-foreground">
          Built for large gatherings in India: multilingual, fast, and inclusive — usable even without typing.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-blue-600" aria-hidden />
              <CardTitle className="text-base">Multilingual Voice Assistant</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Speak in Hindi, Marathi, Bhojpuri, Bengali, Tamil and more. “Mera beta kho gaya hai” — LOFT understands
              and files the report.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2">
              <WifiOff className="h-5 w-5 text-blue-600" aria-hidden />
              <CardTitle className="text-base">Offline-first PWA</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Works with poor connectivity. Queue reports offline and auto-sync when online.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" aria-hidden />
              <CardTitle className="text-base">Photo + Location</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Capture a photo and current location for better matching accuracy.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-blue-600" aria-hidden />
              <CardTitle className="text-base">QR Scan & Share</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Scan found tags and share report QR links for quick reunions.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" aria-hidden />
              <CardTitle className="text-base">Smart Matching</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              AI-assisted matching using description and proximity to suggest likely connections.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-blue-600" aria-hidden />
              <CardTitle className="text-base">Volunteer-friendly</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              A simple dashboard for verifying and confirming matches in real-time.
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-blue-600" aria-hidden />
              <CardTitle className="text-base">Privacy by Design</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Role-based access and Row Level Security. QR links share only what’s required.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-balance">How it works</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Speak or Tap</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Use voice in your language or enter simple details — no typing needed.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Add Photo & Location</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Take a photo and optionally capture your current location.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Smart Match & Confirm</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Volunteers see suggestions, verify, and confirm — then you connect securely.
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kiosk: Speak to LOFT</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Ideal for help desks — a zero-typing experience. Just speak and we’ll file the report.
            <div className="mt-4">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/kiosk">Open Kiosk</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Browse & Scan</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Explore reports near you or scan a QR to jump straight to a case.
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/browse">Browse Nearby</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/scan">Scan a QR</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-10">
        <div className="rounded-xl border p-6 md:p-8">
          <h3 className="text-xl md:text-2xl font-semibold text-balance">Ready to help or need help now?</h3>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Start a Lost or Found report in seconds, speak to LOFT at a kiosk, or join as a volunteer to confirm
            matches.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/lost">Report Lost</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/found">Report Found</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/kiosk">Kiosk: Speak to LOFT</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/volunteer">Volunteer Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
