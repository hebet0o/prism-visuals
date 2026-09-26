import PocketBase, { BaseAuthStore } from 'pocketbase'

// A client per gallery page; never share the administrator's auth store.
export function createGalleryClient(scope) {
  const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'https://api.prismvisuals.hu', new BaseAuthStore())
  pb.autoCancellation(false)
  const key = `prism_gallery_session_${scope}`
  let guestToken = ''
  const read = k => { try { return JSON.parse(sessionStorage.getItem(k)) } catch { return null } }
  const write = (k, v) => { try { v === null ? sessionStorage.removeItem(k) : sessionStorage.setItem(k, JSON.stringify(v)) } catch { /* memory-only */ } }
  const saved = read(key)
  if (saved?.token && saved?.record) pb.authStore.save(saved.token, saved.record)
  const guestKey = () => `prism_guest_${pb.authStore.record?.gallery}`
  const guestRequest = (action, body = {}) => pb.send(`/api/prism/guest/${action}`, { method: 'POST', body, headers: { 'X-Prism-Guest': guestToken } })
  return {
    pb,
    async login(password) {
      const auth = await pb.send('/api/prism/login', { method: 'POST', body: { gallery: scope, password } })
      pb.authStore.save(auth.token, auth.record); write(key, auth)
    },
    session: () => pb.send('/api/prism/session', {}),
    clear() { write(key, null); pb.authStore.clear(); guestToken = '' },
    async logout() {
      await pb.send('/api/prism/logout', { method: 'POST', body: {} })
      write(guestKey(), null)
      this.clear()
    },
    async restoreGuest() {
      guestToken = read(guestKey())?.token || ''
      if (!guestToken) return null
      try { return await guestRequest('me') } catch { guestToken = ''; write(guestKey(), null); return null }
    },
    async guest(action, name, pin) {
      const result = await guestRequest(action, { name, pin })
      guestToken = result.token; write(guestKey(), { token: guestToken })
      return result
    },
    async likes(likedPhotos) { return (await guestRequest('likes', { likedPhotos })).likedPhotos },
    async fileBlob(picture) {
      // Refresh per download batch item, and check status before creating ZIP entries.
      const token = await pb.files.getToken()
      const res = await fetch(pb.files.getURL(picture, picture.image, { token }), { cache: 'no-store', referrerPolicy: 'no-referrer' })
      if (!res.ok) throw new Error('Image download failed')
      return res.blob()
    },
  }
}
