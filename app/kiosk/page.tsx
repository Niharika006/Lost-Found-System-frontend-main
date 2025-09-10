import { AISpeech } from "@/components/ai-speech"
import KioskVoice from "@/components/kiosk-voice"

export default function KioskPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-pretty text-3xl font-semibold">How can we help?</h1>
      <div className="flex items-center justify-center gap-3">
        <AISpeech
          text="Welcome to LOFT. Tap I Lost Something or I Found Something. You can also scan a QR code."
          lang="en-IN"
        />
        <AISpeech
          text="LOFT mein aapka swagat hai. I Lost Something ya I Found Something par dabaiye, ya QR code scan kijiye."
          lang="hi-IN"
        />
        <AISpeech
          text="LOFT मध्ये आपले स्वागत आहे. I Lost Something किंवा I Found Something निवडा, किंवा QR कोड स्कॅन करा."
          lang="mr-IN"
        />
      </div>

      {/* Voice-first section */}
      <div className="w-full">
        <KioskVoice />
      </div>

      <div className="grid w-full grid-cols-1 gap-4">
        <a
          href="/lost"
          className="block rounded-lg bg-blue-600 py-6 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          I Lost Something
        </a>
        <a
          href="/found"
          className="block rounded-lg bg-emerald-600 py-6 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          I Found Something
        </a>
        <a href="/scan" className="block rounded-lg border py-6 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Scan a QR Code
        </a>
      </div>
      <p className="text-sm text-muted-foreground">
        Large buttons. Simple flow. Ideal for help desks and community kiosks.
      </p>
    </main>
  )
}
