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
    return {
      id: record.id,
      name: record.name || '',
      token,
      likedPhotos: parseLikedPhotos(record.likedPhotos),
    }
  } catch {
    return null
  }
}

export const createGuestUser = async (name, token) => {
  if (!name || !token) return null

  try {
    const record = await pb.collection(GUEST_COLLECTION).create({
      name,
      token,
      likedPhotos: JSON.stringify([]),
    })

    return {
      id: record.id,
      name: record.name || '',
      token,
      likedPhotos: [],
    }
  } catch {
    return null
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
