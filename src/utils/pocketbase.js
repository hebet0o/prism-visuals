import PocketBase from 'pocketbase/cjs'

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'http://178.105.33.153:8090')

// Enable auto-cancellation for realtime subscriptions
pb.autoCancellation(false)

export default pb