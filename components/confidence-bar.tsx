"use client"

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100)
  const color = pct >= 80 ? "bg-green-600" : pct >= 60 ? "bg-yellow-400" : "bg-gray-300"
  const label = `Confidence: ${pct}%`

  return (
    <div>
      <div className="w-full h-3 bg-gray-100 rounded-full">
        <div
          className={`h-3 rounded-full ${color}`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
          aria-label="Confidence score"
        />
      </div>
      <div className="text-xs mt-1">{label}</div>
    </div>
  )
}
