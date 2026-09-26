// Read-only, anonymous checks. Does not prove authenticated isolation or file safety.
// For files, separately check known private original/thumbnail URLs, including CDN cache.
const base = process.env.PRISM_AUDIT_URL || 'https://api.prismvisuals.hu'
let failures = 0
for (const [collection, filter] of [
  ['galleries', 'isVisible = false'],
  ['pictures', 'isVisible = false'],
  ['pictures', 'gallery.isVisible = false'],
  ['guest_users', ''],
  ['users', ''],
]) {
  const url = new URL(`/api/collections/${collection}/records`, base)
  url.search = new URLSearchParams({ perPage: '1', fields: 'id', filter })
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) })
    const body = await response.json()
    const denied = response.status === 403 ||
      (response.status === 200 && Array.isArray(body.items) && body.items.length === 0 && body.totalItems === 0)
    console.log(`${denied ? 'PASS' : 'FAIL'} ${collection} ${filter || '(all)'}: HTTP ${response.status}`)
    if (!denied) failures++
  } catch {
    console.log(`FAIL ${collection}: could not verify access`)
    failures++
  }
}
const publicUrl = new URL('/api/collections/galleries/records', base)
publicUrl.search = new URLSearchParams({ perPage: '1', filter: 'isVisible = true', fields: 'id,passwordHash' })
try {
  const response = await fetch(publicUrl, { signal: AbortSignal.timeout(10_000) })
  const body = await response.json()
  const safe = response.ok && body.items?.length > 0 && body.items.every(record => !Object.hasOwn(record, 'passwordHash'))
  console.log(`${safe ? 'PASS' : 'FAIL'} public gallery available without legacy password field`)
  if (!safe) failures++
} catch {
  console.log('FAIL public gallery: could not verify response')
  failures++
}
process.exitCode = failures ? 1 : 0
