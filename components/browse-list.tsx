"use client";

import { useEffect, useMemo, useState } from "react";
import { haversineMeters, type LatLng } from "@/lib/geo";
import Link from "next/link";

type Report = {
  id: string;
  type: "lost" | "found";
  title: string | null;
  description: string | null;
  created_at: string;
  lat: number | null;
  lng: number | null;
};

export default function BrowseList({ initialReports }: { initialReports?: Report[] }) {
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [radius, setRadius] = useState<number>(3000);

  // ✅ Always ensure it's an array
  const reports: Report[] = Array.isArray(initialReports) ? initialReports : [];

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCoords(null),
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 },
    );
  }, []);

  const items: (Report & { distance?: number })[] = useMemo(() => {
    if (!Array.isArray(reports)) return [];

    if (!coords) {
      // If no location → just return reports as-is
      return reports;
    }

    return reports
      .map((r) => {
        const d =
          r.lat != null && r.lng != null
            ? haversineMeters(coords, { lat: r.lat, lng: r.lng })
            : Number.POSITIVE_INFINITY;
        return { ...r, distance: d };
      })
      .filter((r) => (r.distance ?? Number.POSITIVE_INFINITY) <= radius)
      .sort(
        (a, b) =>
          (a.distance ?? Number.POSITIVE_INFINITY) -
          (b.distance ?? Number.POSITIVE_INFINITY),
      );
  }, [coords, reports, radius]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">
          {coords ? "Using your location" : "Turn on location for distance"}
        </div>
        <label className="flex items-center gap-2 text-sm">
          Radius
          <select
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="rounded-md border px-2 py-1"
          >
            <option value={1000}>1 km</option>
            <option value={3000}>3 km</option>
            <option value={5000}>5 km</option>
            <option value={10000}>10 km</option>
          </select>
        </label>
      </div>

      <ul className="divide-y rounded-lg border">
        {items.length > 0 ? (
          items.map((r) => (
            <li key={r.id} className="p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">
                  {r.type}
                </span>
                {coords && r.lat != null && r.lng != null ? (
                  <span className="text-xs text-muted-foreground">
                    {Math.round(r.distance ?? 0)} m
                  </span>
                ) : null}
              </div>
              <h3 className="mt-1 text-lg font-medium">{r.title || "Untitled"}</h3>
              <p className="text-pretty text-sm text-muted-foreground">
                {r.description}
              </p>
              <div className="mt-3 flex items-center gap-3">
                {r.lat != null && r.lng != null ? (
                  <a
                    className="text-sm text-blue-600 underline"
                    href={`https://www.google.com/maps/search/?api=1&query=${r.lat},${r.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Maps
                  </a>
                ) : null}
                <Link className="text-sm underline" href={`/report/${r.id}/share`}>
                  Share
                </Link>
                <Link className="text-sm underline" href={`/match/${r.id}`}>
                  Details
                </Link>
              </div>
            </li>
          ))
        ) : (
          <li className="p-6 text-center text-sm text-muted-foreground">
            No reports within selected radius.
          </li>
        )}
      </ul>
    </section>
  );
}
