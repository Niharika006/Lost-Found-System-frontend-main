import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Megaphone, Network, ShieldCheck, Brain, Handshake, Bot, Globe2 } from "lucide-react"

export function HomeFeatures() {
  const items = [
    {
      title: "Multilingual Voice",
      desc: "Hindi, Marathi, Bhojpuri, Bengali, Tamil and more. Speak naturally — LOFT understands and fills the form for you.",
      icon: <Megaphone className="h-5 w-5 text-blue-600" aria-hidden />,
    },
    {
      title: "Offline-first PWA",
      desc: "Works with poor connectivity. Queue reports offline and auto-sync when back online.",
      icon: <Network className="h-5 w-5 text-blue-600" aria-hidden />,
    },
    {
      title: "Smart Matching",
      desc: "AI-assisted matching using description and location proximity to suggest likely connections.",
      icon: <Brain className="h-5 w-5 text-blue-600" aria-hidden />,
    },
    {
      title: "Volunteer Dashboard",
      desc: "Moderate, verify, and confirm matches in real time. Optimized for crowd volunteers.",
      icon: <Handshake className="h-5 w-5 text-blue-600" aria-hidden />,
    },
    {
      title: "Privacy by Design",
      desc: "Role-based access, Row Level Security, and limited sharing via QR to protect sensitive data.",
      icon: <ShieldCheck className="h-5 w-5 text-blue-600" aria-hidden />,
    },
    {
      title: "Kiosk Mode",
      desc: "Zero-typing kiosk for help desks: pilgrims speak, LOFT registers the report instantly.",
      icon: <Bot className="h-5 w-5 text-blue-600" aria-hidden />,
    },
  ]
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">Why LOFT?</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Built for large gatherings in India: multilingual, fast, and inclusive — usable by anyone, even without
        literacy.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <Card key={it.title} className="h-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <div>{it.icon}</div>
              <CardTitle className="text-base">{it.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{it.desc}</CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 flex items-center gap-2 text-sm">
        <Globe2 className="h-4 w-4 text-green-600" aria-hidden />
        <span className="text-muted-foreground">
          Works on any smartphone — install to Home Screen for the best experience.
        </span>
      </div>
    </section>
  )
}
