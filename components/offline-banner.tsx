"use client"

import { useEffect, useState } from "react"

export function OfflineBanner() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    const update = () => setOnline(typeof navigator !== "undefined" ? navigator.onLine : true)
    update()
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  if (online) return null

  return (
    <div className="bg-yellow-400 text-black text-center py-2" role="status" aria-live="polite">
      You are offline, data will sync later.
    </div>
  )
}
