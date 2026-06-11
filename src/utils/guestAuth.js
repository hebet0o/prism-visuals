import pb from './pocketbase'

const STORAGE_KEYS = {
  token: 'prism_guest_token',
  name: 'prism_guest_name',
}

const GUEST_COLLECTION = 'guest_users'

const parseLikedPhotos = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  try {
    return JSON.parse(value)
  } catch {
    return []
  }
}

const toGuest = (record) => ({
  id: record.id,
  name: record.name || '',
  token: record.token,
  gallery: record.gallery,
  pin: record.pin,
  likedPhotos: parseLikedPhotos(record.likedPhotos),
})

export const getStoredGuestToken = () => localStorage.getItem(STORAGE_KEYS.token)
export const getStoredGuestName = () => localStorage.getItem(STORAGE_KEYS.name)
export const storeGuestToken = (token) => localStorage.setItem(STORAGE_KEYS.token, token)
export const storeGuestName = (name) => localStorage.setItem(STORAGE_KEYS.name, name)

export const clearGuest = () => {
  localStorage.removeItem(STORAGE_KEYS.token)
  localStorage.removeItem(STORAGE_KEYS.name)
}

export const generateGuestToken = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const loadGuestUserByToken = async (token) => {
  if (!token) return null
  try {
    const record = await pb.collection(GUEST_COLLECTION).getFirstListItem(`token = "${token}"`)
    return toGuest(record)
  } catch {
    return null
  }
}

export const loginGuest = async (galleryId, name, pin) => {
  if (!galleryId || !name || !pin) return null
  try {
    const record = await pb.collection(GUEST_COLLECTION).getFirstListItem(
      `gallery = "${galleryId}" && name = "${name}" && pin = "${pin}"`
    )
    return toGuest(record)
  } catch {
    return null
  }
}

export const registerGuest = async (galleryId, name, pin, token) => {
  if (!galleryId || !name || !pin || !token) {
    return { ok: false, reason: 'invalid' }
  }
  const existing = await loginGuest(galleryId, name, pin)
  if (existing) {
    return { ok: false, reason: 'duplicate' }
  }
  try {
    const record = await pb.collection(GUEST_COLLECTION).create({
      gallery: galleryId,
      name,
      pin,
      token,
      likedPhotos: JSON.stringify([]),
    })
    return { ok: true, guest: toGuest(record) }
  } catch (err) {
    console.error('Guest registration failed:', err)
    const status = err?.status
    if (status === 400) {
      return { ok: false, reason: 'duplicate' }
    }
    return { ok: false, reason: 'unknown' }
  }
}

export const updateGuestUserLikes = async (guestId, likedPhotoIds) => {
  if (!guestId) return null
  try {
    const record = await pb.collection(GUEST_COLLECTION).update(guestId, {
      likedPhotos: JSON.stringify(likedPhotoIds),
    })
    return parseLikedPhotos(record.likedPhotos)
  } catch {
    return null
  }
}
