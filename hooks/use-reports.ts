"use client"

import useSWR, { mutate } from "swr"

export type Report = {
  id: string
  type: "lost" | "found"
  name?: string
  age?: number
  description: string
  language: "English" | "Hindi" | "Marathi"
  whereFound?: string
  photos: string[]
  createdAt: number
}

type ReportsData = { lost: Report[]; found: Report[] }

const KEY = "loft:reports"

const fetcher = () => {
  if (typeof window === "undefined") return { lost: [], found: [] } as ReportsData
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ReportsData) : { lost: [], found: [] }
  } catch {
    return { lost: [], found: [] }
  }
}

const save = (data: ReportsData) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {}
}

export function useReports() {
  const { data } = useSWR<ReportsData>(KEY, fetcher, { revalidateOnFocus: false })
  const current: ReportsData = data || { lost: [], found: [] }

  const addReport = (partial: Omit<Report, "id" | "createdAt">) => {
    const newReport: Report = { id: crypto.randomUUID(), createdAt: Date.now(), ...partial }
    const next: ReportsData =
      newReport.type === "lost"
        ? { ...current, lost: [newReport, ...current.lost] }
        : { ...current, found: [newReport, ...current.found] }
    save(next)
    mutate(KEY, next, false)
    return true
  }

  const getReportById = (id: string) => {
    return current.lost.find((r) => r.id === id) || current.found.find((r) => r.id === id)
  }

  return {
    data: current,
    addReport,
    getReportById,
  }
}
