"use client"

import Link from "next/link"
import { ScanLine, PlusCircle, HeartHandshake, MapPin } from "lucide-react"

export default function MobileQuickActions() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden"
      aria-label="Quick actions"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 items-center gap-1 p-2">
        <li>
          <Link
            href="/lost"
            className="flex flex-col items-center justify-center gap-1 rounded-md p-2 text-center text-xs"
            aria-label="Report Lost"
          >
            <PlusCircle className="h-5 w-5" />
            <span>Lost</span>
          </Link>
        </li>
        <li>
          <Link
            href="/found"
            className="flex flex-col items-center justify-center gap-1 rounded-md p-2 text-center text-xs"
            aria-label="Report Found"
          >
            <HeartHandshake className="h-5 w-5" />
            <span>Found</span>
          </Link>
        </li>
        <li>
          <Link
            href="/browse"
            className="flex flex-col items-center justify-center gap-1 rounded-md p-2 text-center text-xs"
            aria-label="Browse Nearby"
          >
            <MapPin className="h-5 w-5" />
            <span>Nearby</span>
          </Link>
        </li>
        <li>
          <Link
            href="/scan"
            className="flex flex-col items-center justify-center gap-1 rounded-md p-2 text-center text-xs"
            aria-label="Scan Code"
          >
            <ScanLine className="h-5 w-5" />
            <span>Scan</span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}
