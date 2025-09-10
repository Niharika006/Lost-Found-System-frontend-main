"use client"

type QueuedItem = {
  id: string
  type: "lost" | "found"
  payload: any
  createdAt: number
}

const KEY = "loft_offline_queue_v1"

function readQueue(): QueuedItem[] {
  try {
    const s = localStorage.getItem(KEY)
    if (!s) return []
    return JSON.parse(s) as QueuedItem[]
  } catch {
    return []
  }
}

function writeQueue(items: QueuedItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function enqueue(type: "lost" | "found", payload: any) {
  const items = readQueue()
  const item: QueuedItem = {
    id: crypto.randomUUID(),
    type,
    payload,
    createdAt: Date.now(),
  }
  writeQueue([item, ...items])
  return item.id
}

export function dequeue(id: string) {
  const items = readQueue().filter((i) => i.id !== id)
  writeQueue(items)
}

export function peekQueue() {
  return readQueue()
}
