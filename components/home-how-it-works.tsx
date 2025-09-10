import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Camera, MapPin, Sparkles, CheckCircle2 } from "lucide-react"

export function HomeHowItWorks() {
  const steps = [
    {
      title: "Speak or Tap",
      desc: "Use voice in your language or enter simple details.",
      icon: <Mic className="h-5 w-5 text-blue-600" aria-hidden />,
    },
    {
      title: "Add Photo",
      desc: "Take or upload a photo for better matching.",
      icon: <Camera className="h-5 w-5 text-blue-600" aria-hidden />,
    },
    {
      title: "Auto Location",
      desc: "We can capture your current location (optional).",
      icon: <MapPin className="h-5 w-5 text-blue-600" aria-hidden />,
    },
    {
      title: "Smart Match",
      desc: "Our engine suggests potential matches in real-time.",
      icon: <Sparkles className="h-5 w-5 text-blue-600" aria-hidden />,
    },
    {
      title: "Confirm & Reunite",
      desc: "Volunteers verify, then you connect securely.",
      icon: <CheckCircle2 className="h-5 w-5 text-blue-600" aria-hidden />,
    },
  ]
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <h2 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">How it works</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((s) => (
          <Card key={s.title} className="h-full">
            <CardHeader className="flex flex-row items-center gap-3">
              <div>{s.icon}</div>
              <CardTitle className="text-base">{s.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{s.desc}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
