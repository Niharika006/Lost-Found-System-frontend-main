"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { ConfidenceBar } from "./confidence-bar"
import type { Match } from "@/lib/types" // Import the Match interface

export function MatchCard({
  match,
  onConfirm,
  onFlag,
}: {
  match: Match
  onConfirm: () => void
  onFlag: () => void
}) {
  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg">Potential Match</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <img
            src={match.lostPhotoUrl || "/placeholder.svg?height=160&width=240&query=lost%20photo"}
            alt="Lost"
            className="w-full h-40 object-cover rounded-lg"
          />
          <img
            src={match.foundPhotoUrl || "/placeholder.svg?height=160&width=240&query=found%20photo"}
            alt="Found"
            className="w-full h-40 object-cover rounded-lg"
          />
        </div>
        <ConfidenceBar value={match.fused_score} />
        {match.scores.distance !== undefined && (
          <p className="text-sm">Distance: <span className="font-medium">{match.scores.distance.toFixed(2)} km</span></p>
        )}
        <p className="text-sm">
          Status: <span className="font-medium capitalize">{match.status}</span>
        </p>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
          <Link href={`/match/${match.id}`}>View Match</Link>
        </Button>
        <Button className="rounded-xl bg-green-600 hover:bg-green-700 text-white" onClick={onConfirm}>
          Confirm Reunited
        </Button>
        <Button variant="outline" className="rounded-xl bg-transparent" onClick={onFlag}>
          Flag False Match
        </Button>
      </CardFooter>
    </Card>
  )
}
