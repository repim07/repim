const CACHE = 'repim-v1'
const PRECACHE = ['/', '/logo-repim.png', '/logo-repim-icon.png', '/villa-hero.jpg']

self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => {})))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  if (request.method !== 'GET') return
  if (!request.url.startsWith('http')) return
  // Ne pas cacher les appels Supabase / API
  if (request.url.includes('supabase.co') || request.url.includes('/api/')) return

  e.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(request, clone))
        }
        return res
      })
      .catch(() => caches.match(request))
  )
})
