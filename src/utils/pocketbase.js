import PocketBase from 'pocketbase/cjs'

const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL || 'https://api.prismvisuals.hu')

// Enable auto-cancellation for realtime subscriptions
pb.autoCancellation(false)

export default pb