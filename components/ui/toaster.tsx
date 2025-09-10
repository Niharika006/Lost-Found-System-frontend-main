"use client"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  // If the project already has a Toaster, this component wraps it gracefully.
  // The default v0 template includes hooks/use-toast and Toast primitives.
  useToast() // ensure mounted
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  )
}
