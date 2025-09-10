"use client"

import type React from "react"
import { VoiceDictation } from "@/components/voice-dictation"
import { AISpeech } from "@/components/ai-speech"
import { useEffect, useRef, useState } from "react"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Card, CardContent } from "./ui/card"
import { toast } from "@/hooks/use-toast"
import { useLanguage } from "./language-provider"
import { createReportFromForm } from "@/app/actions/reports"
import { compressImage } from "@/lib/image"

type Mode = "lost" | "found"

export function ReportForm({ mode }: { mode: Mode }) {
  const { language: globalLanguage } = useLanguage()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [language, setLanguage] = useState(globalLanguage)
  const [locationText, setLocationText] = useState("")
  const [contact, setContact] = useState("")
  const [lat, setLat] = useState<number | "">("")
  const [lng, setLng] = useState<number | "">("")
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const bcp47 = language === "Hindi" ? "hi-IN" : language === "Marathi" ? "mr-IN" : "en-IN"

  useEffect(() => {
    setLanguage(globalLanguage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [globalLanguage])

  const onFiles = async (files: FileList | null) => {
    if (!files || !fileRef.current) return
    const dt = new DataTransfer()
    const previewsLocal: string[] = []
    const max = Math.min(files.length, 6)
    for (let i = 0; i < max; i++) {
      const f = files[i]
      try {
        const blob = await compressImage(f, 1280, 0.82)
        const out = new File([blob], f.name.replace(/\.(png|jpg|jpeg|webp|heic|heif)$/i, ".jpg"), {
          type: "image/jpeg",
        })
        dt.items.add(out)
        previewsLocal.push(URL.createObjectURL(blob))
      } catch {
        dt.items.add(f)
        previewsLocal.push(URL.createObjectURL(f))
      }
    }
    fileRef.current.files = dt.files
    setPreviews(previewsLocal)
  }

  const handleQR = () => {
    try {
      window.location.href = "/scan"
    } catch {
      toast({ title: "QR Scan", description: "Open Scan screen from the navigation." })
    }
  }

  const handleGeolocate = () => {
    if (!("geolocation" in navigator)) {
      toast({ title: "Geolocation unavailable", description: "Your browser does not support geolocation." })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(+pos.coords.latitude.toFixed(6))
        setLng(+pos.coords.longitude.toFixed(6))
        toast({ title: "Location added", description: "We captured your current GPS coordinates." })
      },
      () =>
        toast({ title: "Location error", description: "Could not retrieve your location.", variant: "destructive" }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    )
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    if (!navigator.onLine) {
      // Queue for later
      try {
        const fd = new FormData(e.currentTarget)
        const entries: any[] = []
        fd.forEach((v, k) => {
          if (v instanceof File) {
            entries.push([k, { name: v.name, type: v.type, size: v.size }])
          } else {
            entries.push([k, v])
          }
        })
        const key = "app:pending"
        const arr: any[] = JSON.parse(localStorage.getItem(key) || "[]")
        arr.push({ id: crypto.randomUUID(), payload: entries, at: Date.now() })
        localStorage.setItem(key, JSON.stringify(arr))
        toast({ title: "Saved offline", description: "We’ll send this when you’re back online." })
      } catch {
        toast({ title: "Offline", description: "Could not save offline.", variant: "destructive" })
      }
      e.preventDefault()
      return
    }
    setSubmitting(true)
  }

  const t = {
    English: {
      title: "Title",
      category: "Category",
      categoryPh: "e.g., document, bag, child, phone",
      language: "Language",
      desc: "Description",
      descPh: "Describe the person/item, identifiers, clothing, marks, etc.",
      contact: "Contact (phone or email)",
      contactPh: "How can volunteers reach you?",
      whereFound: "Where found?",
      lastSeen: "Last seen (optional)",
      photo: "Upload Photo",
      qr: "Scan QR",
      useLocation: "Use my location",
      submit: "Submit",
      submitting: "Submitting...",
      safeZone: "Nearest Safe Zone",
      safeZonePh: "Select nearest help point",
      consent: "I agree to share this photo for reunification only.",
      privacy: "Data is automatically deleted after the event.",
      speakPrompt: "Please describe the lost or found person or item. You can also speak in your language.",
    },
    Hindi: {
      title: "शीर्षक",
      category: "श्रेणी",
      categoryPh: "जैसे दस्तावेज़, बैग, बच्चा, फोन",
      language: "भाषा",
      desc: "विवरण",
      descPh: "व्यक्ति/वस्तु का वर्णन करें, कपड़े/पहचान चिन्ह आदि",
      contact: "संपर्क (फोन या ईमेल)",
      contactPh: "स्वयंसेवक आपसे कैसे संपर्क करें?",
      whereFound: "कहाँ मिला?",
      lastSeen: "आखिरी बार कहाँ देखा (वैकल्पिक)",
      photo: "फोटो अपलोड करें",
      qr: "क्यूआर स्कैन",
      useLocation: "मेरा लोकेशन उपयोग करें",
      submit: "जमा करें",
      submitting: "जमा हो रहा है...",
      safeZone: "नज़दीकी सुरक्षित स्थान",
      safeZonePh: "नज़दीकी सहायता केंद्र चुनें",
      consent: "मैं सहमत हूँ कि यह फोटो केवल पुनर्मिलन के लिए साझा होगा।",
      privacy: "कार्यक्रम के बाद डेटा स्वतः हट जाता है।",
      speakPrompt: "कृपया खोए या मिले व्यक्ति/वस्तु का वर्णन करें। आप अपनी भाषा में भी बोल सकते हैं।",
    },
    Marathi: {
      title: "शीर्षक",
      category: "वर्ग",
      categoryPh: "उदा. कागदपत्र, बॅग, मूल, फोन",
      language: "भाषा",
      desc: "वर्णन",
      descPh: "व्यक्ती/वस्तूचे वर्णन करा, कपडे/ओळख चिन्ह इ.",
      contact: "संपर्क (फोन किंवा ईमेल)",
      contactPh: "स्वयंसेवक आपल्याशी कसे संपर्क करतील?",
      whereFound: "कुठे सापडले?",
      lastSeen: "शेवटचे कुठे दिसले (ऐच्छिक)",
      photo: "फोटो अपलोड करा",
      qr: "QR स्कॅन",
      useLocation: "माझे लोकेशन वापरा",
      submit: "सबमिट",
      submitting: "सबमिट होत आहे...",
      safeZone: "जवळचा सुरक्षित झोन",
      safeZonePh: "जवळचा मदत केंद्र निवडा",
      consent: "मी सहमत आहे की हा फोटो फक्त पुनर्मिलनासाठी सामायिक केला जाईल.",
      privacy: "कार्यक्रमानंतर डेटा आपोआप हटवला जातो.",
      speakPrompt: "कृपया हरवलेल्या/सापडलेल्या व्यक्ती/वस्तूचे वर्णन करा. आपण आपल्या भाषेत बोलू शकता.",
    },
  } as const

  const dict = t[language as keyof typeof t]

  return (
    <form action={createReportFromForm} className="space-y-4" ref={formRef} onSubmit={handleSubmit}>
      <input type="hidden" name="type" value={mode} />
      <input type="hidden" name="lat" value={lat === "" ? "" : String(lat)} />
      <input type="hidden" name="lng" value={lng === "" ? "" : String(lng)} />
      <input type="hidden" name="language" value={language} />

      <Card className="rounded-xl">
        <CardContent className="p-4 space-y-4">
          <div>
            <Label htmlFor="title">{dict.title}</Label>
            <Input
              id="title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={mode === "lost" ? `Lost: school bag - blue` : `Found: smartphone - black`}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">{dict.category}</Label>
              <Input
                id="category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={dict.categoryPh}
              />
            </div>
            <div>
              <Label>{dict.language}</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as any)}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">Hindi</SelectItem>
                  <SelectItem value="Marathi">Marathi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="desc">{dict.desc}</Label>
            <Textarea
              id="desc"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={dict.descPh}
              className="min-h-28"
              required
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <VoiceDictation lang={bcp47} onTranscript={(t) => setDescription((d) => (d ? d + " " + t : t))} />
              <AISpeech text={description || dict.speakPrompt} lang={bcp47} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact">{dict.contact}</Label>
              <Input
                id="contact"
                name="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={dict.contactPh}
              />
            </div>

            <div>
              <Label htmlFor="location_text">{mode === "found" ? dict.whereFound : dict.lastSeen}</Label>
              <Input
                id="location_text"
                name="location_text"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder={mode === "found" ? dict.whereFound : dict.lastSeen}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="safe_zone">{dict.safeZone}</Label>
            <select
              id="safe_zone"
              name="safe_zone"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                {dict.safeZonePh}
              </option>
              <option value="Gate 1">Gate 1</option>
              <option value="Gate 2">Gate 2</option>
              <option value="Police Booth 3">Police Booth 3</option>
              <option value="Help Desk A">Help Desk A</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="photo">{dict.photo}</Label>
              <Input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={(e) => onFiles(e.target.files)}
                capture="environment"
              />
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {previews.map((p, i) => (
                    <img
                      key={i}
                      src={p || "/placeholder.svg?height=160&width=240&query=photo%20preview"}
                      alt="Uploaded"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-end gap-2">
              {mode === "found" && (
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-xl bg-gray-100 hover:bg-gray-200"
                  onClick={handleQR}
                >
                  {dict.qr}
                </Button>
              )}
              <Button type="button" variant="outline" className="rounded-xl bg-transparent" onClick={handleGeolocate}>
                {dict.useLocation}
              </Button>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border p-3">
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" name="consent" required className="mt-1" />
              <span>{dict.consent}</span>
            </label>
            <p className="text-xs text-muted-foreground">{dict.privacy}</p>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={submitting}
              className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white w-full md:w-auto"
            >
              {submitting ? dict.submitting : dict.submit}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
