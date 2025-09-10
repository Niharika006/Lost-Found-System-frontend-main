const CACHE_NAME = "loft-cache-v2"
const ASSET_CACHE = "loft-assets-v2"

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME)
      const precache = ["/", "/manifest.webmanifest"]
      // Try to add known icons if present, but don't fail install if missing
      const optional = ["/icons/icon-192.png", "/icons/icon-512.png", "/icons/maskable-512.png"]
      await Promise.all(
        [...precache, ...optional].map(async (url) => {
          try {
            await cache.add(url)
          } catch (e) {
            // ignore missing assets
          }
        }),
      )
      self.skipWaiting()
    })(),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => ![CACHE_NAME, ASSET_CACHE].includes(k)).map((k) => caches.delete(k)))
      self.clients.claim()
    })(),
  )
})

self.addEventListener("message", (event) => {
  if (event?.data?.type === "SKIP_WAITING" && self.skipWaiting) {
    self.skipWaiting()
  }
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return
  const accept = req.headers.get("accept") || ""

  if (accept.includes("text/html")) {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req)
          const copy = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy))
          return res
        } catch {
          // Try page cache, then fallback to home, else minimal offline page
          return (
            (await caches.match(req)) ||
            (await caches.match("/")) ||
            new Response("<!doctype html><title>Offline</title><h1>Offline</h1>", {
              headers: { "content-type": "text/html" },
              status: 200,
            })
          )
        }
      })(),
    )
    return
  }

  event.respondWith(
  (async () => {
    const cached = await caches.match(req)
    if (cached) return cached
    try {
      const networkRes = await fetch(req)
      const resClone = networkRes.clone()
      caches.open(ASSET_CACHE).then((cache) => cache.put(req, resClone))
      return networkRes
    } catch {
      if (accept.startsWith("image/") || req.destination === "image") {
        return new Response("", { status: 200, headers: { "content-type": "image/png" } })
      }
      return new Response("", { status: 504, statusText: "Offline" })
    }
  })(),
)

})
