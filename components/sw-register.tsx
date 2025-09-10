"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export function SwRegister() {
  const { toast } = useToast()

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    let unregisterEvents = () => {}

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js")

        const onNewServiceWorker = (waiting: ServiceWorker) => {
          const doUpdate = () => {
            waiting.postMessage({ type: "SKIP_WAITING" })
          }

          // Show a small toast prompting the user to update
          toast({
            title: "Update available",
            description: "A new version is ready. Reload to update.",
            action: {
              label: "Reload",
              onClick: () => doUpdate(),
            },
          } as any)
        }

        // Update flow
        if (reg.waiting) onNewServiceWorker(reg.waiting)
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New content available
              if (reg.waiting) onNewServiceWorker(reg.waiting)
            }
          })
        })

        // When the controller changes, the page will be controlled by the new SW; reload to get fresh assets
        const onControllerChange = () => {
          window.location.reload()
        }
        navigator.serviceWorker.addEventListener("controllerchange", onControllerChange)

        unregisterEvents = () => {
          navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange)
        }
      } catch {
        // swallow
      }
    }

    if ("requestIdleCallback" in window) {
      ;(window as any).requestIdleCallback(register)
    } else {
      setTimeout(register, 0)
    }

    return () => {
      unregisterEvents()
    }
  }, [toast])

  return null
}
