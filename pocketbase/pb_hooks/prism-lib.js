// CommonJS: loaded independently in PocketBase's request VM.
function one(app, collection, filter, params) {
  return app.findRecordsByFilter(collection, filter, '', 1, 0, params)[0] || null
}
function reply(e, status, data) {
  e.response.header().set('Cache-Control', 'no-store')
  return e.json(status, data)
}
function throttle(e, scope, max) {
  // Use the actual peer, not a spoofable Forwarded/X-Forwarded-For header.
  // Behind Caddy the peer bucket is deliberately shared; the gallery bucket is global.
  const id = $security.sha256(scope).slice(0, 15)
  let blocked = false
  $app.runInTransaction((tx) => {
    let r = one(tx, 'prism_login_limits', 'id = {:id}', { id })
    const now = Date.now()
    if (!r) { r = new Record(tx.findCollectionByNameOrId('prism_login_limits')); r.set('id', id) }
    if (!r.getString('expires') || new Date(r.getString('expires')).getTime() <= now) {
      r.set('hits', 0); r.set('expires', new Date(now + 15 * 60 * 1000).toISOString())
    }
    if (r.getInt('hits') >= max) { blocked = true; return }
    r.set('hits', r.getInt('hits') + 1); tx.save(r)
  })
  if (blocked) throw new TooManyRequestsError('Please wait before trying again.')
}
function access(e) {
  const a = e.auth
  if (!a || a.collection().name !== 'prism_gallery_sessions' || new Date(a.getString('expires')).getTime() <= Date.now()) throw new UnauthorizedError()
  const k = $app.findRecordById('prism_gallery_keys', a.getString('access'))
  if (k.getString('version') !== a.getString('version') || k.getString('gallery') !== a.getString('gallery')) throw new UnauthorizedError()
  return a
}
function guestData(r) {
  return { id: r.id, name: r.getString('name'), gallery: r.getString('gallery'), likedPhotos: r.get('likedPhotos') || [] }
}
module.exports = {
  password(e) {
    if (!e.hasSuperuserAuth() && !(e.auth.collection().name === 'users' && e.auth.id === 'dzuvc18aamn9mno')) throw new ForbiddenError()
    const password = e.requestInfo().body.password
    // bcrypt's 72-byte boundary is enforced, including multibyte characters.
    if (typeof password !== 'string' || password.length < 12 || unescape(encodeURIComponent(password)).length > 72) throw new BadRequestError('Use 12–72 UTF-8 bytes for the password.')
    const id = e.request.pathValue('id')
    $app.runInTransaction((tx) => {
      tx.findRecordById('galleries', id)
      let k = one(tx, 'prism_gallery_keys', 'gallery = {:id}', { id })
      if (!k) { k = new Record(tx.findCollectionByNameOrId('prism_gallery_keys')); k.set('gallery', id); k.set('email', $security.randomString(32) + '@prism.invalid') }
      k.setPassword(password)
      k.set('version', $security.randomString(40))
      tx.save(k)
    })
    return reply(e, 200, { ok: true })
  },
  login(e) {
    const body = e.requestInfo().body
    if (typeof body.gallery !== 'string' || !body.gallery || body.gallery.length > 200 || typeof body.password !== 'string' || unescape(encodeURIComponent(body.password)).length > 72) throw new UnauthorizedError('Invalid gallery or password.')
    throttle(e, 'peer:' + e.remoteIP(), 120)
    // Prefer stable IDs. Slug links work only if unique, never choose an arbitrary duplicate.
    let g = one($app, 'galleries', 'id = {:v}', { v: body.gallery })
    if (!g) {
      const matches = $app.findRecordsByFilter('galleries', 'slug = {:v}', '', 2, 0, { v: body.gallery })
      if (matches.length === 1) g = matches[0]
    }
    throttle(e, 'gallery:' + (g ? g.id : body.gallery), 30)
    const k = g && one($app, 'prism_gallery_keys', 'gallery = {:id}', { id: g.id })
    if (!k || !k.validatePassword(body.password)) throw new UnauthorizedError('Invalid gallery or password.')
    const s = new Record($app.findCollectionByNameOrId('prism_gallery_sessions'))
    s.set('email', $security.randomString(32) + '@prism.invalid')
    s.setPassword($security.randomString(48))
    s.set('gallery', g.id); s.set('access', k.id); s.set('version', k.getString('version'))
    s.set('expires', new Date(Date.now() + 8 * 3600 * 1000).toISOString())
    $app.save(s)
    return reply(e, 200, { token: s.newAuthToken(), record: { id: s.id, collectionName: s.collection().name, gallery: g.id, expires: s.getString('expires') } })
  },
  session(e) {
    const s = access(e)
    const g = $app.findRecordById('galleries', s.getString('gallery'))
    return reply(e, 200, { gallery: { id: g.id, name: g.getString('name'), slug: g.getString('slug') }, expires: s.getString('expires') })
  },
  logout(e) {
    // Revoke only this device's session; other clients remain signed in.
    if (e.auth.collection().name !== 'prism_gallery_sessions') throw new ForbiddenError()
    $app.delete(e.auth)
    return reply(e, 200, { ok: true })
  },
  guest(e) {
    const s = access(e)
    const gallery = s.getString('gallery')
    const action = e.request.pathValue('action')
    const body = e.requestInfo().body
    if (action === 'register' || action === 'login') {
      if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 80 || typeof body.pin !== 'string' || !/^\d{4}$/.test(body.pin)) throw new BadRequestError()
      const name = body.name.trim()
      throttle(e, 'guest:' + gallery + ':' + name.toLowerCase(), 10)
      throttle(e, 'guest-gallery:' + gallery, 60)
      let r = one($app, 'prism_gallery_guests', 'gallery = {:g} && nameKey = {:n}', { g: gallery, n: name.toLowerCase() })
      if (action === 'register') {
        if (r) throw new BadRequestError('Name unavailable.')
        r = new Record($app.findCollectionByNameOrId('prism_gallery_guests'))
        r.set('email', $security.randomString(32) + '@prism.invalid')
        r.set('gallery', gallery); r.set('name', name); r.set('nameKey', name.toLowerCase())
        r.setPassword('prism-pin:' + body.pin); r.set('likedPhotos', []); $app.save(r)
      } else if (!r || !r.validatePassword('prism-pin:' + body.pin)) throw new UnauthorizedError()
      return reply(e, 200, { ...guestData(r), token: r.newAuthToken() })
    }
    let r
    try { r = $app.findAuthRecordByToken(e.request.header.get('X-Prism-Guest'), 'auth') } catch { throw new UnauthorizedError() }
    if (r.collection().name !== 'prism_gallery_guests' || r.getString('gallery') !== gallery) throw new ForbiddenError()
    if (action === 'likes') {
      if (!Array.isArray(body.likedPhotos) || body.likedPhotos.length > 5000) throw new BadRequestError()
      const ids = [...new Set(body.likedPhotos)]
      for (const id of ids) {
        if (typeof id !== 'string' || !/^[a-z0-9]{15}$/.test(id)) throw new BadRequestError()
        const p = $app.findRecordById('pictures', id)
        if (p.getString('gallery') !== gallery) throw new ForbiddenError()
      }
      r.set('likedPhotos', ids); $app.save(r)
    } else if (action !== 'me') throw new NotFoundError()
    return reply(e, 200, guestData(r))
  },
}
