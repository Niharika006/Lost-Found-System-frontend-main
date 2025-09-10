"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    // @ts-ignore
    setSupported(Boolean(window.BarcodeDetector))
  }, [])

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      // @ts-ignore
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] })
      const scan = async () => {
        if (!videoRef.current) return
        const bitmap = await createImageBitmap(videoRef.current)
        const codes = await detector.detect(bitmap)
        if (codes.length > 0) {
          const raw = codes[0].rawValue
          try {
            window.location.href = raw
          } catch {}
          stop()
          return
        }
        requestAnimationFrame(scan)
      }
      requestAnimationFrame(scan)
    } catch {}
  }

  function stop() {
    const stream = videoRef.current?.srcObject as MediaStream | undefined
    stream?.getTracks().forEach((t) => t.stop())
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10 space-y-4">
      <h1 className="text-2xl font-semibold text-balance">Scan QR</h1>
      {supported ? (
        <>
          <video ref={videoRef} className="w-full rounded border" muted playsInline />
          <div className="flex gap-2">
            <Button onClick={start} className="bg-blue-600 hover:bg-blue-700 text-white">
              Start
            </Button>
            <Button variant="outline" onClick={stop}>
              Stop
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">QR scanning not supported. Paste a link/code:</p>
          <Input
            placeholder="https://your-app/match/..."
            onKeyDown={(e) => {
              if (e.key === "Enter") window.location.href = (e.target as HTMLInputElement).value
            }}
          />
        </div>
      )}
    </div>
  )
}
