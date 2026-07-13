import { useState, useEffect } from 'react'
import pb from '../utils/pocketbase'

export function useVisibleGalleries() {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const records = await pb.collection('galleries').getFullList({
          filter: 'isVisible = true',
          sort: '-created'
        })

        const withPictures = await Promise.all(
          records.map(async (gallery) => {
            const pictures = await pb.collection('pictures').getFullList({
              filter: `gallery = "${gallery.id}" && isVisible = true`,
              sort: 'created'
            })
            return { ...gallery, pictures }
          })
        )

        setGalleries(withPictures)
      } catch (err) {
        console.error('Failed to load galleries:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGalleries()
  }, [])

  return { galleries, loading }
}
