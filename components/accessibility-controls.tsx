"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function AccessibilityControls({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [fontScale, setFontScale] = useState<number>(() => {
    if (typeof window === "undefined") return 1
    const saved = Number(localStorage.getItem("app:fontScale") || "1")
    return isNaN(saved) ? 1 : saved
  })
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem("app:highContrast") === "1"
  })

  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.style.setProperty("--app-font-scale", String(fontScale))
    localStorage.setItem("app:fontScale", String(fontScale))
  }, [fontScale])

  useEffect(() => {
    if (typeof document === "undefined") return
    if (highContrast) {
      document.documentElement.setAttribute("data-contrast", "high")
      localStorage.setItem("app:highContrast", "1")
    } else {
      document.documentElement.removeAttribute("data-contrast")
      localStorage.removeItem("app:highContrast")
    }
  }, [highContrast])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-balance">Accessibility</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="font">Text size</Label>
            <Slider
              id="font"
              value={[fontScale]}
              min={0.9}
              max={1.4}
              step={0.05}
              onValueChange={(v) => setFontScale(v[0] ?? 1)}
            />
            <p className="text-sm text-muted-foreground">Adjust overall app text size</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="contrast">High contrast</Label>
              <p className="text-sm text-muted-foreground">Increase contrast for readability</p>
            </div>
            <Switch id="contrast" checked={highContrast} onCheckedChange={setHighContrast} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
