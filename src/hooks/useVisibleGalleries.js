import { useState, useEffect } from 'react'
import pb from '../utils/pocketbase'

export function useVisibleGalleries() {
  const [galleries, setGalleries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const records = await pb.collection('galleries').getFullList({
          filter: 'isVisible = true',
          fields: 'id,name,slug,type,coverId,isVisible',
          sort: '-created'
        })

        const withPictures = await Promise.all(
          records.map(async (gallery) => {
            const pictures = await pb.collection('pictures').getFullList({
              filter: `gallery = "${gallery.id}" && isVisible = true`,
              fields: 'id,collectionId,collectionName,image,gallery,isVisible,altText,description',
              sort: 'created'
            })
            return { ...gallery, pictures }
          })
        )

        setGalleries(withPictures)
      } catch (err) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchGalleries()
  }, [])

  return { galleries, loading, error }
}
