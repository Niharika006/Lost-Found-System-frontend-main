"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export function OfflineQueueToaster() {
  const [pending, setPending] = useState<number>(0)

  useEffect(() => {
    const key = "app:pending"
    const update = () => {
      try {
        const raw = localStorage.getItem(key)
        const arr: any[] = raw ? JSON.parse(raw) : []
        setPending(arr.length)
      } catch {
        setPending(0)
      }
    }
    update()
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) update()
    }
    const onOnline = () => update()

    const onFlush = async () => {
      try {
        const raw = localStorage.getItem(key)
        const arr: any[] = raw ? JSON.parse(raw) : []
        if (!arr.length) return
        const res = await fetch("/api/offline-submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: arr }),
        })
        if (res.ok) {
          localStorage.setItem(key, "[]")
          update()
          toast({ title: "Synced successfully ✅", description: "Your pending reports were sent." })
        } else {
          toast({ title: "Sync failed", description: "We’ll retry automatically.", variant: "destructive" })
        }
      } catch {
        toast({ title: "Sync failed", description: "Check your connection and try again.", variant: "destructive" })
      }
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener("online", onOnline)
    window.addEventListener("app:flush-pending", onFlush as any)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("online", onOnline)
      window.removeEventListener("app:flush-pending", onFlush as any)
    }
  }, [])

  if (pending === 0) return null
  return (
    <div
      className="pointer-events-auto fixed inset-x-0 bottom-16 z-40 mx-auto w-full max-w-md rounded-lg border bg-background p-3 shadow md:bottom-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">
          {pending} pending {pending === 1 ? "report" : "reports"} will send when online.
        </div>
        <Button size="sm" onClick={() => window.dispatchEvent(new Event("app:flush-pending"))}>
          Send now
        </Button>
      </div>
    </div>
  )
}
