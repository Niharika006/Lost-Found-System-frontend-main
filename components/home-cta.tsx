import Link from "next/link"
import { Button } from "@/components/ui/button"

export function HomeCTA() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="rounded-lg border p-6 md:p-8">
        <h3 className="text-balance text-xl font-semibold md:text-2xl">Ready to help or need help now?</h3>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Start a Lost or Found report in seconds, speak to LOFT at a kiosk, or join as a volunteer to confirm matches.
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
  )
}
