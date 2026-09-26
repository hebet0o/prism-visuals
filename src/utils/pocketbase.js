import PocketBase, { BaseAuthStore } from 'pocketbase'

// Read/write admin authentication only in session storage, not persistent storage.
class SessionAuthStore extends BaseAuthStore {
  constructor() {
    super()
    try {
      const saved = JSON.parse(sessionStorage.getItem('pocketbase_auth') || 'null')
      if (saved) super.save(saved.token, saved.record)
      if (!this.isValid) this.clear()
    } catch { /* Keep auth in memory if storage is blocked. */ }
  }
  save(token, record) {
    super.save(token, record)
    try { sessionStorage.setItem('pocketbase_auth', JSON.stringify({ token, record })) } catch { /* In-memory auth only. */ }
  }
  clear() {
    super.clear()
    try { sessionStorage.removeItem('pocketbase_auth') } catch { /* Storage may be blocked. */ }
  }
}
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'https://api.prismvisuals.hu', new SessionAuthStore())

// Enable auto-cancellation for realtime subscriptions
pb.autoCancellation(false)

export default pb
