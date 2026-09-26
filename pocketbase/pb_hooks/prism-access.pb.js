routerAdd('GET', '/api/prism/health', (e) => e.json(200, { version: 1 }))
routerAdd('POST', '/api/prism/login', (e) => require(__hooks + '/prism-lib.js').login(e), $apis.bodyLimit(4096))
routerAdd('POST', '/api/prism/admin/{id}/password', (e) => require(__hooks + '/prism-lib.js').password(e), $apis.requireAuth(), $apis.bodyLimit(4096))
routerAdd('GET', '/api/prism/session', (e) => require(__hooks + '/prism-lib.js').session(e), $apis.requireAuth())
routerAdd('POST', '/api/prism/logout', (e) => require(__hooks + '/prism-lib.js').logout(e), $apis.requireAuth())
routerAdd('POST', '/api/prism/guest/{action}', (e) => require(__hooks + '/prism-lib.js').guest(e), $apis.requireAuth(), $apis.bodyLimit(200000))

// Protected file URLs must never acquire public browser/CDN cache headers.
onFileDownloadRequest((e) => {
  e.requestEvent.response.header().set('Cache-Control', 'private, no-store')
  e.requestEvent.response.header().set('Referrer-Policy', 'no-referrer')
  return e.next()
}, 'pictures')

// Only transient session and rate-limit records; never client pictures or galleries.
cronAdd('prism_expired_sessions', '17 * * * *', () => {
  for (const name of ['prism_gallery_sessions', 'prism_login_limits']) {
    const records = $app.findRecordsByFilter(name, 'expires < {:now}', '', 500, 0, { now: new Date().toISOString() })
    for (const record of records) $app.delete(record)
  }
})
