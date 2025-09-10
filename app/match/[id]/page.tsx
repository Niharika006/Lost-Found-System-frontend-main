"use client"

import { useParams, useRouter } from "next/navigation"
import { useMatches } from "@/hooks/use-matches"
import { getReportById } from "@/app/actions/reports" // Import getReportById server action
import { Match, Report } from "@/lib/types" // Import Match and Report interfaces
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConfidenceBar } from "@/components/confidence-bar"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react" // For loading indicator

export default function MatchDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: matches, updateMatch, isLoading: matchesLoading, error: matchesError } = useMatches()
  const [lostReport, setLostReport] = useState<Report | null>(null)
  const [foundReport, setFoundReport] = useState<Report | null>(null)
  const [reportsLoading, setReportsLoading] = useState(true)
  const [reportsError, setReportsError] = useState<string | null>(null)

  const match = matches.list.find((m) => m.id === id)

  useEffect(() => {
    async function fetchReports() {
      setReportsLoading(true)
      setReportsError(null)
      if (match) {
        try {
          const lostResult = await getReportById(match.lost_report_id)
          if (lostResult.success && lostResult.data) {
            setLostReport(lostResult.data)
          } else {
            setReportsError(lostResult.message || "Failed to fetch lost report.")
          }

          const foundResult = await getReportById(match.found_report_id)
          if (foundResult.success && foundResult.data) {
            setFoundReport(foundResult.data)
          } else {
            setReportsError((prev) => prev ? `${prev} ${foundResult.message || "Failed to fetch found report."}` : foundResult.message || "Failed to fetch found report.")
          }
        } catch (err: any) {
          console.error("Error fetching match reports:", err)
          setReportsError(err.message || "An unexpected error occurred while fetching reports.")
        } finally {
          setReportsLoading(false)
        }
      }
    }
    if (!matchesLoading && match) {
      fetchReports()
    }
  }, [matchesLoading, match])

  if (matchesLoading || reportsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading match details...</p>
      </div>
    )
  }

  if (matchesError || reportsError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-red-500">
        <p>Error: {matchesError || reportsError}</p>
        <Button variant="outline" className="mt-4 bg-transparent" onClick={() => router.push("/volunteer")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-sm">Match not found.</p>
        <Button variant="outline" className="mt-4 bg-transparent" onClick={() => router.push("/volunteer")}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <h2 className="text-2xl md:text-3xl font-semibold">Match Details</h2>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Lost Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lostReport?.photo_urls?.[0] ? (
              <img
                src={lostReport.photo_urls[0]}
                alt="Lost item"
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">No photo</div>
            )}
            {lostReport && (
              <>
                <p className="text-sm">
                  <span className="font-medium">Description:</span> {lostReport.description_text}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Location:</span> {lostReport.location.description || `Lat: ${lostReport.location.latitude.toFixed(4)}, Lng: ${lostReport.location.longitude.toFixed(4)}`}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Language:</span> {lostReport.language}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Found Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {foundReport?.photo_urls?.[0] ? (
              <img
                src={foundReport.photo_urls[0]}
                alt="Found item"
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">No photo</div>
            )}
            {foundReport && (
              <>
                <p className="text-sm">
                  <span className="font-medium">Description:</span> {foundReport.description_text}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Location:</span> {foundReport.location.description || `Lat: ${foundReport.location.latitude.toFixed(4)}, Lng: ${foundReport.location.longitude.toFixed(4)}`}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Language:</span> {foundReport.language}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <ConfidenceBar value={match.fused_score} />
        {match.scores.distance !== undefined && (
          <p className="text-lg font-medium">Distance between reports: {match.scores.distance.toFixed(2)} km</p>
        )}
        <div className="flex gap-3">
          <Button
            className="rounded-xl bg-green-600 hover:bg-green-700 text-white"
            onClick={() => updateMatch(match.id, "CONFIRMED_REUNITED")}
          >
            Confirm Match
          </Button>
          <Button
            variant="outline"
            className="rounded-xl bg-transparent"
            onClick={() => updateMatch(match.id, "FALSE_MATCH")}
          >
            Flag False Match
          </Button>
        </div>
      </div>
    </div>
  )
}
